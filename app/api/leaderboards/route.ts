import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sortForLeaderboard } from "@/lib/scoring"
import { Gender } from "@prisma/client"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const eventId = url.searchParams.get("eventId")
  const scope = url.searchParams.get("scope") || "all" // "all" | "last"
  const gender = url.searchParams.get("gender") as Gender | null
  const ageMin = url.searchParams.get("ageMin")
  const ageMax = url.searchParams.get("ageMax")

  // Determine event filter
  let eventFilter: string | undefined
  if (eventId) {
    eventFilter = eventId
  } else if (scope === "last") {
    const lastEvent = await prisma.event.findFirst({ orderBy: { eventDate: "desc" } })
    if (lastEvent) eventFilter = lastEvent.id
  }

  // Build participant filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participantWhere: any = {}
  if (gender) participantWhere.gender = gender
  if (ageMin) participantWhere.age = { ...participantWhere.age, gte: Number(ageMin) }
  if (ageMax) participantWhere.age = { ...participantWhere.age, lte: Number(ageMax) }

  const attempts = await prisma.attempt.findMany({
    where: {
      status: { in: ["finished", "aborted"] },
      ...(eventFilter && { eventId: eventFilter }),
      participant: Object.keys(participantWhere).length > 0 ? participantWhere : undefined,
    },
    include: {
      participant: true,
      event: true,
    },
  })

  const rows = attempts.map((a) => ({
    attemptId: a.id,
    displayName: a.participant.displayName,
    bibNumber: a.participant.bibNumber,
    gender: a.participant.gender,
    age: a.participant.age,
    eventName: a.event.eventName,
    eventDate: a.event.eventDate,
    status: a.status,
    totalCorrect: a.totalCorrect,
    totalWrong: a.totalWrong,
    totalTimeSec: a.totalTimeSec,
  }))

  const sorted = sortForLeaderboard(rows)
  const ranked = sorted.map((row, i) => ({ rank: i + 1, ...row }))

  return NextResponse.json(ranked)
}
