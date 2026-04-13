import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sortForLeaderboard } from "@/lib/scoring"
import { buildStages, getStageFromList } from "@/lib/stages"

export async function GET(_req: NextRequest, { params }: { params: { eventId: string } }) {
  const { eventId } = params

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  const stages = buildStages(event.exercises)

  const attempts = await prisma.attempt.findMany({
    where: { eventId },
    include: {
      participant: true,
      stageResults: { orderBy: { stageNo: "asc" } },
    },
  })

  const rows = attempts.map((a) => {
    const stage = getStageFromList(stages, a.currentStageNo)
    const livePenalty = a.stageResults.reduce((sum, sr) => sum + sr.penaltySec, 0)
    const liveTimeSec =
      a.status === "in_progress" && a.startedAt
        ? Math.floor((Date.now() - new Date(a.startedAt).getTime()) / 1000) + livePenalty
        : a.totalTimeSec

    return {
      attemptId: a.id,
      displayName: `${a.participant.lastName} ${a.participant.firstName.charAt(0)}.`,
      bibNumber: a.participant.bibNumber,
      gender: a.participant.gender,
      age: Math.floor((Date.now() - new Date(a.participant.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
      status: a.status,
      currentStageNo: a.currentStageNo,
      currentStageTitle: stage?.title || "",
      totalTimeSec: liveTimeSec,
      penaltyTimeSec: a.status === "in_progress" ? livePenalty : a.penaltyTimeSec,
      startedAt: a.startedAt,
    }
  })

  const sorted = sortForLeaderboard(rows)
  const ranked = sorted.map((row, i) => ({ rank: i + 1, ...row }))

  return NextResponse.json({ event, participants: ranked })
}
