import logicData from "@/data/tests/logic.json"
import memoryData from "@/data/tests/memory.json"
import reactionData from "@/data/tests/reaction.json"
import spatialData from "@/data/tests/spatial.json"
import stroopData from "@/data/tests/stroop.json"

export const PENALTY_SEC = 15
export const ANSWER_TIME_SEC = 20
export const PREP_TIME_SEC = 3
export const STATION_MAX_SEC = 180

type Category = "logic" | "memory" | "reaction" | "spatial" | "stroop"

const MEMORY_SUBTYPES = new Set(["grid_positions", "symbol_sequence", "object_recognition"])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEST_BANKS: Record<Category, any[]> = {
  logic: (logicData as { items: unknown[] }).items,
  memory: (memoryData as { items: unknown[] }).items,
  reaction: (reactionData as { items: unknown[] }).items.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t: any) => t.subtype === "target_number_search"
  ),
  spatial: (spatialData as { items: unknown[] }).items,
  stroop: (stroopData as { items: unknown[] }).items,
}

// Distribution per station: total 24 = memory:4, stroop:5, logic:5, spatial:5, reaction:5
const STATION_PICKS: Record<number, Record<Category, number>> = {
  0: { memory: 2, stroop: 2, logic: 1, spatial: 2, reaction: 1 },
  1: { memory: 1, stroop: 2, logic: 2, spatial: 1, reaction: 2 },
  2: { memory: 1, stroop: 1, logic: 2, spatial: 2, reaction: 2 },
}

// Simple seeded PRNG (mulberry32) — deterministic per eventId
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

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Greedy interleave: no two consecutive tasks from same category
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interleaveByCategory(tasks: any[], rng: () => number): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups: Record<string, any[]> = {}
  for (const t of tasks) {
    const cat = t.category as string
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(t)
  }
  for (const cat of Object.keys(groups)) {
    groups[cat] = shuffleWithRng(groups[cat], rng)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = []
  let lastCat = ""

  for (let i = 0; i < tasks.length; i++) {
    const candidates = Object.keys(groups)
      .filter((c) => groups[c].length > 0 && c !== lastCat)
      .sort((a, b) => groups[b].length - groups[a].length)

    if (candidates.length === 0) {
      const forced = Object.keys(groups).find((c) => groups[c].length > 0)!
      result.push(groups[forced].pop()!)
      lastCat = forced
    } else {
      const cat = candidates[0]
      result.push(groups[cat].pop()!)
      lastCat = cat
    }
  }

  return result
}

// Generate random grid cells for memory_grid tasks, deterministic per eventId + taskId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function randomizeGridCells(task: any, rng: () => number): any {
  if (task.render?.mode !== "memory_grid") return task
  const gridSize: number = task.render.grid_size || 6
  const cellCount = task.payload.cells_to_memorize.length

  const allCells: number[][] = []
  for (let r = 1; r <= gridSize; r++) {
    for (let c = 1; c <= gridSize; c++) {
      allCells.push([r, c])
    }
  }

  const shuffled = shuffleWithRng(allCells, rng)
  const newCells = shuffled.slice(0, cellCount)
  return {
    ...task,
    payload: { ...task.payload, cells_to_memorize: newCells },
    correct_answer: newCells,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shuffleOptions(task: any, rng?: () => number): any {
  if (!Array.isArray(task.options)) return task
  const mode = task.render?.mode
  if (mode === "memory_grid" || mode === "sequence_recall") {
    return task
  }
  const shuffled = rng ? shuffleWithRng(task.options, rng) : shuffleArray(task.options)
  return { ...task, options: shuffled }
}

// Cumulative picks across stations 0..stationIndex-1 for a given category
function cumulativePicks(stationIndex: number, cat: Category): number {
  let total = 0
  for (let s = 0; s < stationIndex; s++) {
    total += STATION_PICKS[s][cat]
  }
  return total
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCognitiveBlock(stationIndex: 0 | 1 | 2, eventId?: string, heatNumber?: number): any[] {
  const heat = heatNumber || 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: any[] = []

  const categories: Category[] = ["logic", "stroop", "memory", "reaction", "spatial"]
  const picks = STATION_PICKS[stationIndex]

  // Use a heat-based RNG to select which tests to pick from the bank
  const selectionRng = eventId
    ? seededRng(hashString(eventId + ":heat:" + heat + ":select:" + stationIndex))
    : null

  for (const cat of categories) {
    const bank = TEST_BANKS[cat]
    const pick = picks[cat]

    if (selectionRng) {
      // Shuffle the entire bank with heat-based seed, then take the right slice
      const shuffledBank = shuffleWithRng(bank, seededRng(hashString(eventId + ":heat:" + heat + ":bank:" + cat)))
      const start = cumulativePicks(stationIndex, cat)
      const picked = shuffledBank.slice(start, start + pick)
      tasks.push(...picked)
    } else {
      // Fallback: sequential pick
      const start = cumulativePicks(stationIndex, cat)
      const picked = bank.slice(start, start + pick)
      tasks.push(...picked)
    }
  }

  if (eventId) {
    const rng = seededRng(hashString(eventId + ":heat:" + heat + ":station:" + stationIndex))
    return interleaveByCategory(tasks, rng)
      .map((t) => shuffleOptions(t, rng))
      .map((t) => randomizeGridCells(t, rng))
  }

  // Fallback: random (for debug/preview)
  const fallbackRng = seededRng(Math.floor(Math.random() * 1000000))
  return interleaveByCategory(tasks, fallbackRng).map((t) => shuffleOptions(t))
}

export interface AnswerLogEntry {
  taskIndex: number
  taskId: string
  taskType: string
  wasCorrect: boolean
  responseTimeMs: number
  selectedOption: unknown
  correctOption: unknown
  partialErrors?: number
}

export interface BlockResult {
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  penaltySec: number
  rawAnswersJson: AnswerLogEntry[]
}

// Count partial errors for memory tasks (how many individual elements were wrong)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function countMemoryPartialErrors(task: any, selected: unknown): number {
  const correct = task.correct_answer
  if (!Array.isArray(correct) || !Array.isArray(selected)) return 1

  if (Array.isArray(correct[0])) {
    // grid_positions: count how many selected cells are not in correct
    const correctSet = new Set(correct.map((c: number[]) => `${c[0]},${c[1]}`))
    const selectedArr = selected as number[][]
    let errors = 0
    for (const s of selectedArr) {
      if (!correctSet.has(`${s[0]},${s[1]}`)) errors++
    }
    // Also count missing correct cells
    const selectedSet = new Set(selectedArr.map((s) => `${s[0]},${s[1]}`))
    for (const c of correct) {
      if (!selectedSet.has(`${c[0]},${c[1]}`)) errors++
    }
    return Math.min(errors, correct.length)
  }

  // sequences: count positional mismatches
  let errors = 0
  const maxLen = Math.max(correct.length, (selected as unknown[]).length)
  for (let i = 0; i < maxLen; i++) {
    if (String(correct[i]) !== String((selected as unknown[])[i])) errors++
  }
  return Math.min(errors, correct.length)
}

// Proportional memory penalty: 1 wrong = 1x, 2-3 wrong = 2x, 4-5 wrong = 3x
function memoryPenaltyMultiplier(partialErrors: number): number {
  if (partialErrors <= 1) return 1
  if (partialErrors <= 3) return 2
  return 3
}

export function computeBlockResult(answers: AnswerLogEntry[], totalTasks: number, penaltySec: number = PENALTY_SEC): BlockResult {
  const correctAnswers = answers.filter((a) => a.wasCorrect).length
  const wrongAnswers = answers.filter((a) => !a.wasCorrect).length
  const skippedAnswers = totalTasks - answers.length

  // Calculate penalty: proportional for memory, flat for others
  let totalPenalty = skippedAnswers * penaltySec
  for (const a of answers) {
    if (a.wasCorrect) continue
    if (MEMORY_SUBTYPES.has(a.taskType)) {
      const errors = a.partialErrors ?? 1
      totalPenalty += memoryPenaltyMultiplier(errors) * penaltySec
    } else {
      totalPenalty += penaltySec
    }
  }

  return {
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    penaltySec: totalPenalty,
    rawAnswersJson: answers,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkAnswer(task: any, selected: unknown): boolean {
  const correct = task.correct_answer

  if (Array.isArray(correct) && Array.isArray(selected)) {
    if (correct.length !== (selected as unknown[]).length) return false
    // For grid_positions: compare as sets of [row,col]
    if (Array.isArray(correct[0])) {
      const sortPairs = (arr: number[][]) =>
        [...arr].sort((a, b) => a[0] - b[0] || a[1] - b[1])
      const a = sortPairs(correct as number[][])
      const b = sortPairs(selected as number[][])
      return JSON.stringify(a) === JSON.stringify(b)
    }
    // For sequences: compare in order
    return JSON.stringify(correct) === JSON.stringify(selected)
  }

  return String(correct) === String(selected)
}

export function isMemoryTask(taskType: string): boolean {
  return MEMORY_SUBTYPES.has(taskType)
}
