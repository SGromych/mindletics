import { AttemptStatus } from "@prisma/client"

interface AttemptLike {
  status: AttemptStatus
  currentStageNo: number
}

export function canStart(attempt: AttemptLike): boolean {
  return attempt.status === "registered"
}

export function canAdvance(attempt: AttemptLike): boolean {
  return attempt.status === "in_progress" && attempt.currentStageNo >= 1
}

export function canAbort(attempt: AttemptLike): boolean {
  return attempt.status === "in_progress"
}
