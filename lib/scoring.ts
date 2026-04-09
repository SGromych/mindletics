import { AttemptStatus } from "@prisma/client"

interface ScoredAttempt {
  status: AttemptStatus
  totalTimeSec: number
}

const STATUS_PRIORITY: Record<string, number> = {
  finished: 0,
  in_progress: 1,
  registered: 2,
  aborted: 3,
}

export function sortForLeaderboard<T extends ScoredAttempt>(attempts: T[]): T[] {
  return [...attempts].sort((a, b) => {
    const aPri = STATUS_PRIORITY[a.status] ?? 2
    const bPri = STATUS_PRIORITY[b.status] ?? 2
    if (aPri !== bPri) return aPri - bPri

    return a.totalTimeSec - b.totalTimeSec
  })
}
