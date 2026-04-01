import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStage, isLastStage, getNextStageNo } from "@/lib/stages"

import { Prisma } from "@prisma/client"

interface StageResultPayload {
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  rawAnswersJson: Prisma.InputJsonValue
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { attemptId, stageResult }: { attemptId: string; stageResult?: StageResultPayload } = body

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
  const currentStageNo = attempt.currentStageNo

  // Finalize current StageResult
  const currentSR = attempt.stageResults.find((sr) => sr.stageNo === currentStageNo && !sr.finishedAt)
  if (currentSR) {
    const durationSec = Math.floor((now.getTime() - new Date(currentSR.startedAt).getTime()) / 1000)

    await prisma.stageResult.update({
      where: { id: currentSR.id },
      data: {
        finishedAt: now,
        durationSec,
        ...(stageResult && {
          correctAnswers: stageResult.correctAnswers,
          wrongAnswers: stageResult.wrongAnswers,
          skippedAnswers: stageResult.skippedAnswers,
          rawAnswersJson: stageResult.rawAnswersJson,
        }),
      },
    })
  }

  // If last stage — finish the attempt
  if (isLastStage(currentStageNo)) {
    // Sum up all cognitive stage results
    const allResults = await prisma.stageResult.findMany({
      where: { attemptId: attempt.id },
    })
    const totalCorrect = allResults.reduce((sum, r) => sum + r.correctAnswers, 0)
    const totalWrong = allResults.reduce((sum, r) => sum + r.wrongAnswers, 0)
    const totalTimeSec = Math.floor((now.getTime() - new Date(attempt.startedAt!).getTime()) / 1000)

    // Add current stage result data that was just saved
    const finalCorrect = stageResult
      ? totalCorrect - (currentSR?.correctAnswers ?? 0) + stageResult.correctAnswers
      : totalCorrect
    const finalWrong = stageResult
      ? totalWrong - (currentSR?.wrongAnswers ?? 0) + stageResult.wrongAnswers
      : totalWrong

    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: "finished",
        finishedAt: now,
        totalTimeSec,
        totalCorrect: finalCorrect,
        totalWrong: finalWrong,
      },
      include: { stageResults: true, participant: true, event: true },
    })

    return NextResponse.json(updated)
  }

  // Advance to next stage
  const nextNo = getNextStageNo(currentStageNo)!
  const nextStage = getStage(nextNo)!

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      currentStageNo: nextNo,
      stageResults: {
        create: {
          stageNo: nextNo,
          stageType: nextStage.type,
          stageTitle: nextStage.title,
          startedAt: now,
        },
      },
    },
    include: { stageResults: true, participant: true, event: true },
  })

  return NextResponse.json(updated)
}
