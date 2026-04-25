import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sortForLeaderboard } from "@/lib/scoring"
import { Gender } from "@prisma/client"

function computeAge(birthDate: Date): number {
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const eventId = url.searchParams.get("eventId")
  const scope = url.searchParams.get("scope") || "all"
  const gender = url.searchParams.get("gender") as Gender | null
  const ageMin = url.searchParams.get("ageMin")
  const ageMax = url.searchParams.get("ageMax")
  const heatParam = url.searchParams.get("heat")

  let eventFilter: string | undefined
  if (eventId) {
    eventFilter = eventId
  } else if (scope === "last") {
    const lastEvent = await prisma.event.findFirst({ orderBy: { eventDate: "desc" } })
    if (lastEvent) eventFilter = lastEvent.id
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participantWhere: any = {}
  if (gender) participantWhere.gender = gender
  if (heatParam) participantWhere.heatNumber = Number(heatParam)

  // Convert age filters to birthDate range
  const now = new Date()
  if (ageMax) {
    // ageMax=30 means born at least 30 years ago → birthDate >= (now - 31 years + 1 day approx)
    const minBirth = new Date(now.getFullYear() - Number(ageMax) - 1, now.getMonth(), now.getDate())
    participantWhere.birthDate = { ...participantWhere.birthDate, gte: minBirth }
  }
  if (ageMin) {
    // ageMin=20 means born at most 20 years ago → birthDate <= (now - 20 years)
    const maxBirth = new Date(now.getFullYear() - Number(ageMin), now.getMonth(), now.getDate())
    participantWhere.birthDate = { ...participantWhere.birthDate, lte: maxBirth }
  }

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
    displayName: `${a.participant.lastName} ${a.participant.firstName.charAt(0)}.`,
    bibNumber: a.participant.bibNumber,
    gender: a.participant.gender,
    age: computeAge(a.participant.birthDate),
    eventName: a.event.eventName,
    eventDate: a.event.eventDate,
    heatNumber: a.participant.heatNumber,
    status: a.status,
    totalTimeSec: a.totalTimeSec,
    penaltyTimeSec: a.penaltyTimeSec,
  }))

  const sorted = sortForLeaderboard(rows)
  const ranked = sorted.map((row, i) => ({ rank: i + 1, ...row }))

  return NextResponse.json(ranked)
}
