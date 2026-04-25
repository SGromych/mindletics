import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { hallName, eventName, eventDate, exercises, heatCount, penaltySec, mode } = body

  if (!hallName || !eventName || !eventDate) {
    return NextResponse.json({ error: "hallName, eventName, eventDate are required" }, { status: 400 })
  }

  if (!Array.isArray(exercises) || exercises.length !== 3) {
    return NextResponse.json({ error: "exercises must be an array of exactly 3 items" }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      hallName,
      eventName,
      eventDate: new Date(eventDate),
      exercises,
      heatCount: heatCount ? Number(heatCount) : 1,
      penaltySec: penaltySec ? Number(penaltySec) : 15,
      mode: mode === "games" ? "games" : "cognitive",
    },
  })

  return NextResponse.json(event, { status: 201 })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const activeOnly = url.searchParams.get("active") === "true"

  const where = activeOnly
    ? { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } }
    : {}

  const events = await prisma.event.findMany({
    where,
    orderBy: { eventDate: "desc" },
  })

  return NextResponse.json(events)
}
