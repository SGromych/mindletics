import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildStages, isLastStage, getNextStageNo, getStageFromList } from "@/lib/stages"

import { Prisma } from "@prisma/client"

interface StageResultPayload {
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  penaltySec: number
  rawAnswersJson: Prisma.InputJsonValue
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { attemptId, stageResult }: { attemptId: string; stageResult?: StageResultPayload } = body

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { stageResults: true, event: true },
  })

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }
  if (attempt.status !== "in_progress") {
    return NextResponse.json({ error: "Attempt is not in progress" }, { status: 400 })
  }

  const now = new Date()
  const currentStageNo = attempt.currentStageNo
  const stages = buildStages(attempt.event.exercises)

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
          penaltySec: stageResult.penaltySec,
          rawAnswersJson: stageResult.rawAnswersJson,
        }),
      },
    })
  }

  // If last stage — finish the attempt
  if (isLastStage(currentStageNo)) {
    const allResults = await prisma.stageResult.findMany({
      where: { attemptId: attempt.id },
    })

    const totalPenalty = allResults.reduce((sum, r) => sum + r.penaltySec, 0)
      + (stageResult ? stageResult.penaltySec - (currentSR?.penaltySec ?? 0) : 0)

    const elapsedSec = Math.floor((now.getTime() - new Date(attempt.startedAt!).getTime()) / 1000)
    const totalTimeSec = elapsedSec + totalPenalty

    const totalCorrect = allResults.reduce((sum, r) => sum + r.correctAnswers, 0)
      + (stageResult ? stageResult.correctAnswers - (currentSR?.correctAnswers ?? 0) : 0)
    const totalWrong = allResults.reduce((sum, r) => sum + r.wrongAnswers, 0)
      + (stageResult ? stageResult.wrongAnswers - (currentSR?.wrongAnswers ?? 0) : 0)

    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: "finished",
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

  // Advance to next stage
  const nextNo = getNextStageNo(currentStageNo)!
  const nextStage = getStageFromList(stages, nextNo)!

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
