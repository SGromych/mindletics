import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { attemptId } = await req.json()

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { stageResults: true },
  })

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }
  if (attempt.status !== "in_progress") {
    return NextResponse.json({ error: "Attempt is not in progress" }, { status: 400 })
  }

  const now = new Date()

  // Finalize current stage
  const currentSR = attempt.stageResults.find((sr) => sr.stageNo === attempt.currentStageNo && !sr.finishedAt)
  if (currentSR) {
    await prisma.stageResult.update({
      where: { id: currentSR.id },
      data: {
        finishedAt: now,
        durationSec: Math.floor((now.getTime() - new Date(currentSR.startedAt).getTime()) / 1000),
      },
    })
  }

  // Sum up results including penalties
  const allResults = await prisma.stageResult.findMany({ where: { attemptId: attempt.id } })
  const totalCorrect = allResults.reduce((sum, r) => sum + r.correctAnswers, 0)
  const totalWrong = allResults.reduce((sum, r) => sum + r.wrongAnswers, 0)
  const totalPenalty = allResults.reduce((sum, r) => sum + r.penaltySec, 0)

  const elapsedSec = attempt.startedAt
    ? Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
    : 0
  const totalTimeSec = elapsedSec + totalPenalty

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: "aborted",
      finishedAt: now,
      totalTimeSec,
      penaltyTimeSec: totalPenalty,
      totalCorrect,
      totalWrong,
    },
    include: { stageResults: true, participant: true, event: true },
  })

  return NextResponse.json(updated)
}
