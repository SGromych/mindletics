import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { firstName, lastName, birthDate, gender, bibNumber, eventId } = body

  if (!firstName || !lastName || !birthDate || !gender || !bibNumber || !eventId) {
    return NextResponse.json(
      { error: "firstName, lastName, birthDate, gender, bibNumber, eventId are required" },
      { status: 400 }
    )
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  // Check if event has expired (1 hour from creation)
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
  if (event.createdAt < hourAgo) {
    return NextResponse.json({ error: "Event has expired (1 hour limit)" }, { status: 400 })
  }

  const participant = await prisma.participant.create({
    data: {
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      gender,
      bibNumber,
      eventId,
    },
  })

  // Auto-create attempt in registered status
  const attempt = await prisma.attempt.create({
    data: {
      participantId: participant.id,
      eventId,
    },
  })

  return NextResponse.json({ participant, attemptId: attempt.id }, { status: 201 })
}
