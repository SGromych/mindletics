import logicData from "@/data/tests/logic.json"
import memoryData from "@/data/tests/memory.json"
import reactionData from "@/data/tests/reaction.json"
import spatialData from "@/data/tests/spatial.json"
import stroopData from "@/data/tests/stroop.json"

export const PENALTY_SEC = 20
export const ANSWER_TIME_SEC = 20
export const PREP_TIME_SEC = 3
export const STATION_MAX_SEC = 180

type Category = "logic" | "memory" | "reaction" | "spatial" | "stroop"

const CATEGORIES: Category[] = ["logic", "stroop", "memory", "reaction", "spatial"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEST_BANKS: Record<Category, any[]> = {
  logic: (logicData as { items: unknown[] }).items,
  memory: (memoryData as { items: unknown[] }).items,
  reaction: (reactionData as { items: unknown[] }).items,
  spatial: (spatialData as { items: unknown[] }).items,
  stroop: (stroopData as { items: unknown[] }).items,
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shuffleOptions(task: any): any {
  if (!Array.isArray(task.options)) return task
  const mode = task.render?.mode
  if (mode === "memory_grid" || mode === "sequence_recall" || mode === "go_no_go_single_button") {
    return task
  }
  return { ...task, options: shuffleArray(task.options) }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCognitiveBlock(stationIndex: 0 | 1 | 2): any[] {
  const tasks: unknown[] = []

  for (const cat of CATEGORIES) {
    const items = TEST_BANKS[cat]
    const start = stationIndex * 2
    const picked = items.slice(start, start + 2)
    tasks.push(...picked)
  }

  return shuffleArray(tasks).map(shuffleOptions)
}

export interface AnswerLogEntry {
  taskIndex: number
  taskId: string
  taskType: string
  wasCorrect: boolean
  responseTimeMs: number
  selectedOption: unknown
  correctOption: unknown
}

export interface BlockResult {
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  penaltySec: number
  rawAnswersJson: AnswerLogEntry[]
}

export function computeBlockResult(answers: AnswerLogEntry[], totalTasks: number): BlockResult {
  const correctAnswers = answers.filter((a) => a.wasCorrect).length
  const wrongAnswers = answers.filter((a) => !a.wasCorrect).length
  const skippedAnswers = totalTasks - answers.length
  const penaltySec = (wrongAnswers + skippedAnswers) * PENALTY_SEC

  return {
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    penaltySec,
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
