import type { TestType } from "./stages"

import logicData from "@/data/tests/logic.json"
import memoryData from "@/data/tests/memory.json"
import reactionData from "@/data/tests/reaction.json"
import visualData from "@/data/tests/visual_final.json"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEST_DATA: Record<TestType, any[]> = {
  logic: logicData,
  memory: memoryData,
  reaction: reactionData,
  visual_final: visualData,
}

// Fisher-Yates shuffle returning new array + index mapping
function shuffleWithMapping<T>(arr: T[]): { shuffled: T[]; newIndexOf: number[] } {
  const indices = arr.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const shuffled = indices.map((i) => arr[i])
  // newIndexOf[oldIdx] = newIdx
  const newIndexOf = new Array(arr.length) as number[]
  indices.forEach((oldIdx, newIdx) => { newIndexOf[oldIdx] = newIdx })
  return { shuffled, newIndexOf }
}

// Simple Fisher-Yates shuffle (no index mapping needed)
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shuffleTaskOptions(task: any): any {
  // Shuffle standard options + correctOption index
  if (Array.isArray(task.options) && typeof task.correctOption === "number") {
    const { shuffled, newIndexOf } = shuffleWithMapping(task.options)
    return {
      ...task,
      options: shuffled,
      correctOption: newIndexOf[task.correctOption],
    }
  }
  // Shuffle memory-specific fields (matching is by value, not index)
  let result = task
  if (Array.isArray(task.selectable)) {
    result = { ...result, selectable: shuffleArray(task.selectable) }
  }
  if (Array.isArray(task.allShapes)) {
    result = { ...result, allShapes: shuffleArray(task.allShapes) }
  }
  return result
}

export function loadTestBlock(testType: TestType) {
  const tasks = TEST_DATA[testType] || []
  return tasks.map(shuffleTaskOptions)
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
  rawAnswersJson: AnswerLogEntry[]
}

export function computeBlockResult(answers: AnswerLogEntry[]): BlockResult {
  const correctAnswers = answers.filter((a) => a.wasCorrect).length
  const wrongAnswers = answers.filter((a) => !a.wasCorrect).length
  return {
    correctAnswers,
    wrongAnswers,
    skippedAnswers: 0,
    rawAnswersJson: answers,
  }
}
