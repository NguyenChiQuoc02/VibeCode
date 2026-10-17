/** Logic thuần của trò chơi dò mìn (không phụ thuộc React) để dễ kiểm thử. */

export type Level = "easy" | "medium" | "hard";

export const LEVELS: Record<Level, { label: string; rows: number; cols: number; mines: number }> = {
  easy: { label: "Dễ", rows: 9, cols: 9, mines: 10 },
  medium: { label: "Vừa", rows: 16, cols: 16, mines: 40 },
  hard: { label: "Khó", rows: 16, cols: 30, mines: 99 },
};

export interface Cell {
  mine: boolean;
  /** Số mìn ở 8 ô xung quanh. */
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
}

export type Status = "ready" | "playing" | "won" | "lost";

export interface Game {
  rows: number;
  cols: number;
  mines: number;
  cells: Cell[];
  status: Status;
  /** Ô mìn người chơi vừa bấm trúng (khi thua). */
  exploded: number | null;
}

export type Rng = () => number;

export function createGame(level: Level): Game {
  const { rows, cols, mines } = LEVELS[level];
  return {
    rows,
    cols,
    mines,
    status: "ready",
    exploded: null,
    cells: Array.from({ length: rows * cols }, () => ({ mine: false, adjacent: 0, revealed: false, flagged: false })),
  };
}

/** Chỉ số các ô lân cận (tối đa 8) của ô idx. */
export function neighbors(game: Pick<Game, "rows" | "cols">, idx: number): number[] {
  const r = Math.floor(idx / game.cols);
  const c = idx % game.cols;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < game.rows && nc >= 0 && nc < game.cols) out.push(nr * game.cols + nc);
    }
  }
  return out;
}

const cloneCells = (cells: Cell[]): Cell[] => cells.map((c) => ({ ...c }));

/** Rải mìn sau lần bấm đầu tiên: ô được bấm và các ô quanh nó luôn an toàn (nếu bàn đủ chỗ). */
function placeMines(game: Game, safe: number, rng: Rng): Cell[] {
  const cells = cloneCells(game.cells);
  const total = cells.length;
  const forbidden = new Set<number>([safe, ...neighbors(game, safe)]);
  // Bàn nhỏ mà quá nhiều mìn thì chỉ giữ riêng ô được bấm là an toàn.
  if (total - forbidden.size < game.mines) {
    forbidden.clear();
    forbidden.add(safe);
  }
  const candidates: number[] = [];
  for (let i = 0; i < total; i++) if (!forbidden.has(i)) candidates.push(i);
  // Xáo trộn Fisher-Yates rồi lấy `mines` ô đầu.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (const idx of candidates.slice(0, game.mines)) cells[idx].mine = true;
  for (let i = 0; i < total; i++) {
    if (!cells[i].mine) cells[i].adjacent = neighbors(game, i).filter((n) => cells[n].mine).length;
  }
  return cells;
}

const revealedCount = (cells: Cell[]) => cells.filter((c) => c.revealed).length;

/** Kết thúc ván: thua thì mở mọi mìn, thắng thì cắm cờ mọi mìn. */
function finish(game: Game, cells: Cell[], status: "won" | "lost", exploded: number | null): Game {
  for (const c of cells) {
    if (status === "lost" && c.mine && !c.flagged) c.revealed = true;
    if (status === "won" && c.mine) c.flagged = true;
  }
  return { ...game, cells, status, exploded };
}

/** Mở ô idx. Ô trống (0 mìn xung quanh) sẽ mở lan ra các ô lân cận. */
export function reveal(game: Game, idx: number, rng: Rng = Math.random): Game {
  if (game.status === "won" || game.status === "lost") return game;
  let cells = game.cells;
  let current = game;
  if (game.status === "ready") {
    cells = placeMines(game, idx, rng);
    current = { ...game, cells, status: "playing" };
  } else {
    cells = cloneCells(game.cells);
  }
  const target = cells[idx];
  if (target.flagged || target.revealed) return game.status === "ready" ? current : game;

  if (target.mine) {
    target.revealed = true;
    return finish(current, cells, "lost", idx);
  }

  const stack = [idx];
  while (stack.length > 0) {
    const i = stack.pop()!;
    const cell = cells[i];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) for (const n of neighbors(game, i)) if (!cells[n].revealed) stack.push(n);
  }

  if (revealedCount(cells) === cells.length - game.mines) return finish(current, cells, "won", null);
  return { ...current, cells };
}

/** Cắm hoặc gỡ cờ trên ô chưa mở. */
export function toggleFlag(game: Game, idx: number): Game {
  if (game.status === "won" || game.status === "lost") return game;
  const cell = game.cells[idx];
  if (cell.revealed) return game;
  const cells = cloneCells(game.cells);
  cells[idx].flagged = !cells[idx].flagged;
  return { ...game, cells };
}

/** Bấm vào ô số đã mở: nếu số cờ xung quanh khớp thì mở nốt các ô còn lại (có thể nổ nếu cắm sai). */
export function chord(game: Game, idx: number, rng: Rng = Math.random): Game {
  if (game.status !== "playing") return game;
  const cell = game.cells[idx];
  if (!cell.revealed || cell.adjacent === 0) return game;
  const around = neighbors(game, idx);
  if (around.filter((n) => game.cells[n].flagged).length !== cell.adjacent) return game;
  let next = game;
  for (const n of around) {
    if (!next.cells[n].flagged && !next.cells[n].revealed) next = reveal(next, n, rng);
  }
  return next;
}

export const flagsUsed = (game: Game) => game.cells.filter((c) => c.flagged).length;
