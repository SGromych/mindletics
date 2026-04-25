import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const attemptId = url.searchParams.get("attemptId")
  const eventId = url.searchParams.get("eventId")
  const heatParam = url.searchParams.get("heat")

  // If attemptId is provided, return full breakdown
  if (attemptId) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        participant: true,
        event: true,
        stageResults: { orderBy: { stageNo: "asc" } },
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    return NextResponse.json(attempt)
  }

  // If eventId is provided, return participants list for selection
  if (eventId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const participantWhere: any = { eventId }
    if (heatParam) {
      participantWhere.heatNumber = Number(heatParam)
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        eventId,
        status: { in: ["finished", "aborted"] },
        participant: heatParam ? { heatNumber: Number(heatParam) } : undefined,
      },
      include: {
        participant: true,
      },
      orderBy: { finishedAt: "desc" },
    })

    const rows = attempts.map((a) => ({
      attemptId: a.id,
      participantId: a.participant.id,
      displayName: `${a.participant.lastName} ${a.participant.firstName.charAt(0)}.`,
      fullName: `${a.participant.lastName} ${a.participant.firstName}`,
      bibNumber: a.participant.bibNumber,
      heatNumber: a.participant.heatNumber,
      status: a.status,
      totalTimeSec: a.totalTimeSec,
      penaltyTimeSec: a.penaltyTimeSec,
    }))

    return NextResponse.json(rows)
  }

  return NextResponse.json({ error: "eventId or attemptId required" }, { status: 400 })
}
