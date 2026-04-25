import chessData from "@/data/games/chess.json"
import sudokuData from "@/data/games/sudoku.json"

export const GAME_ANSWER_TIME_SEC = 20
export const GAME_PREP_TIME_SEC = 3
export const GAME_STATION_MAX_SEC = 180

type GameCategory = "chess" | "sudoku"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GAME_BANKS: Record<GameCategory, any[]> = {
  chess: (chessData as { items: unknown[] }).items,
  sudoku: (sudokuData as { items: unknown[] }).items,
}

// Reuse seeded PRNG from test-engine pattern
function seededRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return hash
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shuffleOptions(task: any, rng: () => number): any {
  if (!Array.isArray(task.options)) return task
  return { ...task, options: shuffleWithRng(task.options, rng) }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interleaveChessSudoku(tasks: any[], rng: () => number): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chess: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sudoku: any[] = []
  for (const t of tasks) {
    if (t.category === "chess") chess.push(t)
    else sudoku.push(t)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = []
  let ci = 0, si = 0
  // Start with whichever has more, alternate
  let lastCat = rng() < 0.5 ? "chess" : "sudoku"

  while (ci < chess.length || si < sudoku.length) {
    if (lastCat === "chess" && si < sudoku.length) {
      result.push(sudoku[si++])
      lastCat = "sudoku"
    } else if (lastCat === "sudoku" && ci < chess.length) {
      result.push(chess[ci++])
      lastCat = "chess"
    } else if (ci < chess.length) {
      result.push(chess[ci++])
      lastCat = "chess"
    } else {
      result.push(sudoku[si++])
      lastCat = "sudoku"
    }
  }

  return result
}

// 4 chess + 4 sudoku per station = 8 tasks
const PICKS_PER_STATION: Record<GameCategory, number> = { chess: 4, sudoku: 4 }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildGameBlock(stationIndex: 0 | 1 | 2, eventId?: string, heatNumber?: number): any[] {
  const heat = heatNumber || 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: any[] = []

  const categories: GameCategory[] = ["chess", "sudoku"]

  for (const cat of categories) {
    const bank = GAME_BANKS[cat]
    const pick = PICKS_PER_STATION[cat]

    if (eventId) {
      const bankRng = seededRng(hashString(eventId + ":heat:" + heat + ":gamebank:" + cat))
      const shuffledBank = shuffleWithRng(bank, bankRng)
      const start = stationIndex * pick
      const picked = shuffledBank.slice(start, start + pick)
      tasks.push(...picked)
    } else {
      const start = stationIndex * pick
      const picked = bank.slice(start, start + pick)
      tasks.push(...picked)
    }
  }

  if (eventId) {
    const rng = seededRng(hashString(eventId + ":heat:" + heat + ":gamestation:" + stationIndex))
    return interleaveChessSudoku(tasks, rng).map((t) => shuffleOptions(t, rng))
  }

  // Fallback for preview
  const fallbackRng = seededRng(Math.floor(Math.random() * 1000000))
  return interleaveChessSudoku(tasks, fallbackRng).map((t) => shuffleOptions(t, fallbackRng))
}
