package com.vibecode.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** Đẩy file lên Cloudinary. Ảnh và video dùng resource_type tương ứng, tài liệu (pdf, docx, xlsx...) dùng "raw". */
@Service
public class CloudinaryStorage {

    private static final long MB = 1024L * 1024L;

    private enum Kind {
        IMAGE("image", 10 * MB, Set.of("png", "jpg", "jpeg", "webp", "gif")),
        VIDEO("video", 100 * MB, Set.of("mp4", "webm", "mov")),
        RAW("raw", 10 * MB, Set.of("pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt"));

        final String resourceType;
        final long maxBytes;
        final Set<String> extensions;

        Kind(String resourceType, long maxBytes, Set<String> extensions) {
            this.resourceType = resourceType;
            this.maxBytes = maxBytes;
            this.extensions = extensions;
        }

        static Kind of(String ext) {
            for (Kind k : values()) if (k.extensions.contains(ext)) return k;
            return null;
        }
    }

    private final String url;
    private final String folder;
    private Cloudinary client;

    public CloudinaryStorage(@Value("${app.cloudinary.url:}") String url, @Value("${app.cloudinary.folder:vibecode}") String folder) {
        this.url = url == null ? "" : url.trim();
        this.folder = folder;
    }

    private synchronized Cloudinary client() {
        if (client == null) {
            if (!url.startsWith("cloudinary://")) {
                throw new UploadException(HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình Cloudinary cho file-service (biến CLOUDINARY_URL)");
            }
            client = new Cloudinary(url);
            client.config.secure = true;
        }
        return client;
    }

    public Map<String, Object> upload(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        int dot = original.lastIndexOf('.');
        String ext = dot < 0 ? "" : original.substring(dot + 1).toLowerCase(Locale.ROOT);
        Kind kind = Kind.of(ext);

        if (file.isEmpty()) throw new UploadException(HttpStatus.BAD_REQUEST, "File rỗng");
        if (kind == null) {
            throw new UploadException(HttpStatus.BAD_REQUEST, "Định dạng không được hỗ trợ. Chấp nhận ảnh (png, jpg, webp, gif), video (mp4, webm, mov), tài liệu (pdf, doc, docx, xls, xlsx, ppt, pptx, csv, txt)");
        }
        if (file.getSize() > kind.maxBytes) {
            throw new UploadException(HttpStatus.PAYLOAD_TOO_LARGE, "File không được lớn hơn " + (kind.maxBytes / MB) + "MB");
        }

        // Tên đặt lại bằng UUID để không trùng và không lộ tên gốc trong URL; file raw giữ đuôi để tải về đúng định dạng.
        String id = UUID.randomUUID().toString();
        Map<String, Object> options = ObjectUtils.asMap(
                "resource_type", kind.resourceType,
                "folder", folder,
                "public_id", kind == Kind.RAW ? id + "." + ext : id,
                "overwrite", false);

        Map<?, ?> result;
        try {
            result = client().uploader().upload(file.getBytes(), options);
        } catch (UploadException e) {
            throw e;
        } catch (RuntimeException | IOException e) {
            throw new UploadException(HttpStatus.BAD_GATEWAY, "Không tải được file lên Cloudinary: " + e.getMessage());
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("url", result.get("secure_url"));
        out.put("publicId", result.get("public_id"));
        out.put("resourceType", kind.resourceType);
        out.put("format", result.get("format") != null ? result.get("format") : ext);
        out.put("bytes", result.get("bytes"));
        out.put("originalName", original);
        return out;
    }
}
