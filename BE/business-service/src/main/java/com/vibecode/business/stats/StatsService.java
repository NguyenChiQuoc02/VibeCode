package com.vibecode.business.stats;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Lấy số liệu thống kê từ dashboard Superset (nguồn dữ liệu là Elasticsearch) để FE tự vẽ biểu đồ.
 * Kết quả được cache trong bộ nhớ vài chục giây, các chart được truy vấn song song, cache được làm nóng khi khởi động,
 * và nếu Superset lỗi thì trả bản cache cũ thay vì báo lỗi.
 */
@Service
public class StatsService {

    private static final Logger log = LoggerFactory.getLogger(StatsService.class);
    private static final String UNKNOWN = "Không xác định";

    /** type: kpi | pie | bar. Với kpi chỉ có một phần tử trong values. */
    public record Chart(int id, String name, String type, boolean horizontal, List<String> labels, List<Double> values) {}

    public record Tab(String title, List<Chart> charts) {}

    public record Dashboard(String title, long updatedAt, List<Tab> tabs) {}

    private final SupersetClient superset;
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExecutorService pool = Executors.newFixedThreadPool(8, r -> {
        Thread t = new Thread(r, "superset-stats");
        t.setDaemon(true);
        return t;
    });
    private final String slug;
    private final long ttlMillis;
    private volatile Dashboard cached;

    public StatsService(SupersetClient superset,
                        @Value("${app.superset.dashboard-slug:vibecode-thong-ke}") String slug,
                        @Value("${app.superset.cache-seconds:60}") long cacheSeconds) {
        this.superset = superset;
        this.slug = slug;
        this.ttlMillis = cacheSeconds * 1000;
    }

    /** Làm nóng cache để người dùng đầu tiên mở trang không phải chờ Superset. */
    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        CompletableFuture.runAsync(() -> {
            try {
                dashboard();
            } catch (RuntimeException e) {
                log.warn("Chưa làm nóng được cache thống kê: {}", e.getMessage());
            }
        });
    }

    public Dashboard dashboard() {
        Dashboard c = cached;
        if (c != null && fresh(c)) return c;
        synchronized (this) {
            c = cached;
            if (c != null && fresh(c)) return c;
            try {
                cached = load();
            } catch (RuntimeException e) {
                if (c == null) throw e;
                log.warn("Superset lỗi, dùng số liệu cũ: {}", e.getMessage());
                return c;
            }
            return cached;
        }
    }

    private boolean fresh(Dashboard d) {
        return System.currentTimeMillis() - d.updatedAt() < ttlMillis;
    }

    private Dashboard load() {
        JsonNode dash = superset.get("/api/v1/dashboard/" + slug).path("result");
        JsonNode chartList = superset.get("/api/v1/dashboard/" + slug + "/charts").path("result");

        // Thông tin chart (tên, loại) theo id; dữ liệu của mọi chart được lấy song song.
        List<Integer> ids = new ArrayList<>();
        java.util.Map<Integer, JsonNode> meta = new java.util.HashMap<>();
        for (JsonNode c : chartList) {
            int id = c.path("id").asInt();
            ids.add(id);
            meta.put(id, c);
        }
        java.util.Map<Integer, CompletableFuture<JsonNode>> data = new java.util.HashMap<>();
        for (int id : ids) data.put(id, CompletableFuture.supplyAsync(() -> superset.get("/api/v1/chart/" + id + "/data/").path("result").path(0), pool));

        JsonNode position;
        try {
            position = mapper.readTree(dash.path("position_json").asText("{}"));
        } catch (Exception e) {
            throw new IllegalStateException("position_json của dashboard không hợp lệ");
        }

        List<Tab> tabs = new ArrayList<>();
        JsonNode tabsNode = position.path("TABS-main");
        if (tabsNode.isMissingNode()) {
            tabs.add(new Tab(dash.path("dashboard_title").asText("Thống kê"), build(collectCharts(position, "GRID_ID"), meta, data)));
        } else {
            for (JsonNode tabId : tabsNode.path("children")) {
                JsonNode tab = position.path(tabId.asText());
                tabs.add(new Tab(tab.path("meta").path("text").asText(tabId.asText()), build(collectCharts(position, tabId.asText()), meta, data)));
            }
        }
        return new Dashboard(dash.path("dashboard_title").asText("Thống kê"), System.currentTimeMillis(), tabs);
    }

    /** Duyệt cây bố cục của dashboard, lấy id chart theo đúng thứ tự hiển thị. */
    private List<Integer> collectCharts(JsonNode position, String nodeId) {
        List<Integer> out = new ArrayList<>();
        JsonNode node = position.path(nodeId);
        if ("CHART".equals(node.path("type").asText())) {
            out.add(node.path("meta").path("chartId").asInt());
        }
        for (JsonNode child : node.path("children")) out.addAll(collectCharts(position, child.asText()));
        return out;
    }

    private List<Chart> build(List<Integer> ids, java.util.Map<Integer, JsonNode> meta, java.util.Map<Integer, CompletableFuture<JsonNode>> data) {
        List<Chart> charts = new ArrayList<>();
        for (int id : ids) {
            JsonNode m = meta.get(id);
            if (m == null) continue;
            JsonNode result = data.get(id).join();
            JsonNode cols = result.path("colnames");
            String valueCol = cols.path(cols.size() - 1).asText();
            String labelCol = cols.size() > 1 ? cols.path(0).asText() : null;

            List<String> labels = new ArrayList<>();
            List<Double> values = new ArrayList<>();
            for (JsonNode row : result.path("data")) {
                labels.add(labelCol == null || row.path(labelCol).isNull() ? (labelCol == null ? "" : UNKNOWN) : row.path(labelCol).asText());
                values.add(row.path(valueCol).asDouble());
            }

            JsonNode form = m.path("form_data");
            String viz = form.path("viz_type").asText(m.path("viz_type").asText());
            String type = switch (viz) {
                case "big_number_total" -> "kpi";
                case "pie" -> "pie";
                default -> "bar";
            };
            charts.add(new Chart(id, m.path("slice_name").asText(), type, "horizontal".equals(form.path("orientation").asText()), labels, values));
        }
        return charts;
    }
}
