import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { hallName, eventName, eventDate } = body

  if (!hallName || !eventName || !eventDate) {
    return NextResponse.json({ error: "hallName, eventName, eventDate are required" }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      hallName,
      eventName,
      eventDate: new Date(eventDate),
    },
  })

  return NextResponse.json(event, { status: 201 })
}

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: "desc" },
  })

  return NextResponse.json(events)
}
