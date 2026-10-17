"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, ButtonBase, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import { SITE } from "@/components/site/tokens";
import { Game, LEVELS, Level, chord, createGame, flagsUsed, reveal, toggleFlag } from "@/lib/minesweeper";

const BEST_KEY = "vibecode_minesweeper_best";
const NUMBER_COLORS = ["", "#1976D2", "#2E7D32", "#D32F2F", "#512DA8", "#BF360C", "#00838F", "#212121", "#757575"];
const CELL_SIZE: Record<Level, number> = { easy: 40, medium: 34, hard: 30 };
const LONG_PRESS_MS = 380;

type Best = Partial<Record<Level, number>>;

function loadBest(): Best {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? "{}") as Best;
  } catch {
    return {};
  }
}

/** Số hiển thị kiểu màn hình LED (3 chữ số, cho phép âm). */
function Led({ value }: { value: number }) {
  const text = value < 0 ? `-${String(Math.min(99, -value)).padStart(2, "0")}` : String(Math.min(999, value)).padStart(3, "0");
  return (
    <Box sx={{ minWidth: 74, px: 1.25, py: 0.5, borderRadius: 2, bgcolor: "#0B1F1C", color: "#FF5A4A", fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: 28, letterSpacing: 3, textAlign: "center", textShadow: "0 0 10px rgba(255,90,74,0.7)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)" }}>{text}</Box>
  );
}

interface CellProps {
  index: number;
  size: number;
  revealed: boolean;
  flagged: boolean;
  mine: boolean;
  adjacent: number;
  exploded: boolean;
  lost: boolean;
  onOpen: (i: number) => void;
  onFlag: (i: number) => void;
  onChord: (i: number) => void;
  flagMode: boolean;
}

/** Một ô: memo để chỉ vẽ lại các ô thay đổi khi bàn có hàng trăm ô. */
const CellView = memo(function CellView({ index, size, revealed, flagged, mine, adjacent, exploded, lost, onOpen, onFlag, onChord, flagMode }: CellProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  // Chạm giữ trên màn hình cảm ứng để cắm cờ.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch" || revealed) return;
    longPressed.current = false;
    clearTimer();
    timer.current = setTimeout(() => {
      longPressed.current = true;
      onFlag(index);
    }, LONG_PRESS_MS);
  };

  const onClick = () => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (revealed) onChord(index);
    else if (flagMode) onFlag(index);
    else onOpen(index);
  };

  const wrongFlag = lost && flagged && !mine;
  const showMine = revealed && mine;

  let content: React.ReactNode = null;
  if (wrongFlag) content = "❌";
  else if (flagged) content = "🚩";
  else if (showMine) content = "💣";
  else if (revealed && adjacent > 0) content = adjacent;

  const hidden = !revealed && !flagged;
  return (
    <ButtonBase
      component="div"
      role="button"
      aria-label={revealed ? (mine ? "Mìn" : `Ô đã mở, ${adjacent} mìn xung quanh`) : flagged ? "Ô đã cắm cờ" : "Ô chưa mở"}
      onClick={onClick}
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault();
        if (!revealed) onFlag(index);
      }}
      onAuxClick={(e: React.MouseEvent) => {
        if (e.button === 1) {
          e.preventDefault();
          onChord(index);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
      sx={{
        width: size,
        height: size,
        borderRadius: "6px",
        fontSize: size * 0.5,
        fontWeight: 800,
        lineHeight: 1,
        userSelect: "none",
        touchAction: "manipulation",
        color: NUMBER_COLORS[adjacent] || "#222",
        background: exploded ? "#FF5A4A" : showMine ? "#FFD9D4" : hidden || flagged ? "linear-gradient(145deg, #3FD0A6 0%, #0E9F7A 100%)" : "#EAF6F1",
        boxShadow: hidden || flagged ? "inset 2px 2px 2px rgba(255,255,255,0.55), inset -2px -2px 3px rgba(0,0,0,0.22)" : "inset 0 0 0 1px rgba(11,61,53,0.1)",
        transition: "filter .1s, transform .08s",
        "&:hover": hidden ? { filter: "brightness(1.1)" } : undefined,
        "&:active": hidden ? { transform: "scale(0.94)" } : undefined,
        cursor: revealed && adjacent === 0 ? "default" : "pointer",
      }}
    >
      {content}
    </ButtonBase>
  );
});

/** Trò chơi dò mìn: 3 độ khó, lần bấm đầu luôn an toàn, cắm cờ bằng chuột phải hoặc chạm giữ, bấm vào ô số để mở nhanh. */
export default function Minesweeper() {
  const [level, setLevel] = useState<Level>("easy");
  const [game, setGame] = useState<Game>(() => createGame("easy"));
  const [seconds, setSeconds] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [best, setBest] = useState<Best>({});
  const startedAt = useRef<number | null>(null);
  const [newRecord, setNewRecord] = useState(false);

  useEffect(() => setBest(loadBest()), []);

  const restart = useCallback((next: Level) => {
    setLevel(next);
    setGame(createGame(next));
    setSeconds(0);
    setNewRecord(false);
    startedAt.current = null;
  }, []);

  // Đồng hồ chạy từ lần mở ô đầu tiên đến khi thắng/thua.
  useEffect(() => {
    if (game.status === "playing") {
      if (startedAt.current === null) startedAt.current = Date.now();
      const id = setInterval(() => setSeconds(Math.min(999, Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000))), 250);
      return () => clearInterval(id);
    }
    if (game.status === "won" || game.status === "lost") {
      if (startedAt.current !== null) setSeconds(Math.min(999, Math.max(1, Math.floor((Date.now() - startedAt.current) / 1000))));
    }
  }, [game.status]);

  // Thắng thì cập nhật kỷ lục của độ khó hiện tại.
  useEffect(() => {
    if (game.status !== "won") return;
    const time = Math.max(1, Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000));
    const current = loadBest();
    if (current[level] === undefined || time < (current[level] as number)) {
      const updated = { ...current, [level]: time };
      localStorage.setItem(BEST_KEY, JSON.stringify(updated));
      setBest(updated);
      setNewRecord(true);
    }
  }, [game.status, level]);

  const onOpen = useCallback((i: number) => setGame((g) => reveal(g, i)), []);
  const onFlag = useCallback((i: number) => setGame((g) => toggleFlag(g, i)), []);
  const onChord = useCallback((i: number) => setGame((g) => chord(g, i)), []);

  const size = CELL_SIZE[level];
  const lost = game.status === "lost";
  const won = game.status === "won";
  const minesLeft = game.mines - flagsUsed(game);

  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: level === "hard" ? "1fr" : "auto 320px" }, alignItems: "start", justifyContent: "center" }}>
      <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: 6, bgcolor: "#fff", boxShadow: SITE.shadowHover, maxWidth: "100%", overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <ToggleButtonGroup exclusive value={level} onChange={(_, v: Level | null) => v && restart(v)} size="small" sx={{ "& .MuiToggleButton-root": { px: 2.25, fontWeight: 700, textTransform: "none", borderRadius: "20px !important", mx: 0.25, border: `1px solid ${SITE.line} !important` }, "& .Mui-selected": { color: "#fff !important", background: SITE.gradientBrand } }}>
            {(Object.keys(LEVELS) as Level[]).map((k) => (
              <ToggleButton key={k} value={k}>
                {LEVELS[k].label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography sx={{ fontSize: 13, color: SITE.muted }}>
            {LEVELS[level].cols}×{LEVELS[level].rows} · {LEVELS[level].mines} mìn
            {best[level] !== undefined && <b style={{ color: SITE.coral }}> · Kỷ lục {best[level]}s</b>}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ mb: 2, p: 1.25, borderRadius: 3, bgcolor: SITE.mist }}>
          <Led value={minesLeft} />
          <Stack direction="row" spacing={1.25} alignItems="center">
            <ButtonBase onClick={() => restart(level)} aria-label="Ván mới" sx={{ width: 52, height: 52, borderRadius: "50%", fontSize: 30, bgcolor: "#fff", boxShadow: SITE.shadow, transition: "transform .15s", "&:hover": { transform: "rotate(-8deg) scale(1.08)" } }}>
              {won ? "😎" : lost ? "😵" : "🙂"}
            </ButtonBase>
            <Button onClick={() => setFlagMode((v) => !v)} aria-pressed={flagMode} startIcon={<FlagIcon />} sx={{ height: 40, borderRadius: 5, px: 2, fontWeight: 700, color: flagMode ? "#fff" : SITE.brandDark, background: flagMode ? SITE.gradientCoral : "rgba(14,124,91,0.1)" }}>
              Cắm cờ
            </Button>
          </Stack>
          <Led value={seconds} />
        </Stack>

        <Box sx={{ overflowX: "auto", pb: 1 }}>
          <Box
            onContextMenu={(e) => e.preventDefault()}
            sx={{ display: "grid", gridTemplateColumns: `repeat(${game.cols}, ${size}px)`, gap: "3px", width: "fit-content", mx: "auto", p: 1, borderRadius: 3, bgcolor: "rgba(14,124,91,0.12)", opacity: lost ? 0.96 : 1 }}
          >
            {game.cells.map((c, i) => (
              <CellView key={i} index={i} size={size} revealed={c.revealed} flagged={c.flagged} mine={c.mine} adjacent={c.adjacent} exploded={game.exploded === i} lost={lost} flagMode={flagMode} onOpen={onOpen} onFlag={onFlag} onChord={onChord} />
            ))}
          </Box>
        </Box>

        {(won || lost) && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 4, textAlign: "center", color: "#fff", background: won ? SITE.gradientBrand : "linear-gradient(135deg, #D6453A 0%, #FF7A59 100%)" }}>
            <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24 }}>{won ? "Chúc mừng, bạn đã rà xong bãi mìn!" : "Bùm! Bạn đã dẫm phải mìn"}</Typography>
            <Typography sx={{ mt: 0.5, opacity: 0.95 }}>
              {won ? `Thời gian: ${seconds} giây${newRecord ? " · Kỷ lục mới!" : ""}` : "Thử lại nhé, ô đầu tiên luôn an toàn."}
            </Typography>
            <Button onClick={() => restart(level)} sx={{ mt: 1.5, px: 4, height: 42, borderRadius: 5, fontWeight: 700, color: won ? SITE.brand : "#D6453A", bgcolor: "#fff", "&:hover": { bgcolor: "#FFF4EE" } }}>
              Chơi lại
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 3, borderRadius: 6, bgcolor: "#fff", boxShadow: SITE.shadow }}>
        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 22, color: SITE.ink }}>Cách chơi</Typography>
        <Box component="ul" sx={{ mt: 1.5, pl: 2.5, "& li": { fontSize: 14, lineHeight: 1.75, color: SITE.ink, mb: 0.75 }, "& li::marker": { color: SITE.coral } }}>
          <li>Mở hết các ô <b>không có mìn</b> để thắng.</li>
          <li>Con số trên ô là số mìn nằm ở 8 ô xung quanh nó.</li>
          <li><b>Bấm chuột trái</b> để mở ô, <b>chuột phải</b> để cắm cờ 🚩 (trên điện thoại: chạm giữ hoặc bật nút &quot;Cắm cờ&quot;).</li>
          <li>Bấm vào <b>ô số</b> đã cắm đủ cờ xung quanh để mở nhanh các ô còn lại (hoặc bấm chuột giữa).</li>
          <li>Ô bạn bấm đầu tiên và các ô quanh nó luôn an toàn.</li>
        </Box>
        <Typography sx={{ mt: 2, fontSize: 12.5, color: SITE.muted }}>Kỷ lục được lưu trên trình duyệt của bạn cho từng độ khó.</Typography>
      </Box>
    </Box>
  );
}
