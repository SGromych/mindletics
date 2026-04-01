import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sortForLeaderboard } from "@/lib/scoring"
import { getStage } from "@/lib/stages"

export async function GET(_req: NextRequest, { params }: { params: { eventId: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.eventId } })
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  const attempts = await prisma.attempt.findMany({
    where: { eventId: params.eventId },
    include: {
      participant: true,
      stageResults: { orderBy: { stageNo: "asc" } },
    },
  })

  const rows = attempts.map((a) => {
    const stage = getStage(a.currentStageNo)
    const liveTimeSec =
      a.status === "in_progress" && a.startedAt
        ? Math.floor((Date.now() - new Date(a.startedAt).getTime()) / 1000)
        : a.totalTimeSec

    // Compute live correct/wrong from StageResults (not only from finished Attempt totals)
    const liveCorrect = a.stageResults.reduce((sum, sr) => sum + sr.correctAnswers, 0)
    const liveWrong = a.stageResults.reduce((sum, sr) => sum + sr.wrongAnswers, 0)

    return {
      attemptId: a.id,
      displayName: a.participant.displayName,
      bibNumber: a.participant.bibNumber,
      gender: a.participant.gender,
      age: a.participant.age,
      status: a.status,
      currentStageNo: a.currentStageNo,
      currentStageTitle: stage?.title || "",
      totalCorrect: a.status === "in_progress" ? liveCorrect : a.totalCorrect,
      totalWrong: a.status === "in_progress" ? liveWrong : a.totalWrong,
      totalTimeSec: liveTimeSec,
      startedAt: a.startedAt,
    }
  })

  const sorted = sortForLeaderboard(rows)
  const ranked = sorted.map((row, i) => ({ rank: i + 1, ...row }))

  return NextResponse.json({ event, participants: ranked })
}
