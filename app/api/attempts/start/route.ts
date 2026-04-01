import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStage } from "@/lib/stages"

export async function POST(req: NextRequest) {
  const { attemptId } = await req.json()

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { event: true },
  })

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }
  if (attempt.status !== "registered") {
    return NextResponse.json({ error: "Attempt already started" }, { status: 400 })
  }

  // Check 1-hour event limit
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
  if (attempt.event.createdAt < hourAgo) {
    return NextResponse.json({ error: "Event has expired (1 hour limit)" }, { status: 400 })
  }

  const now = new Date()
  const stage = getStage(1)!

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: "in_progress",
      startedAt: now,
      currentStageNo: 1,
      stageResults: {
        create: {
          stageNo: 1,
          stageType: stage.type,
          stageTitle: stage.title,
          startedAt: now,
        },
      },
    },
    include: { stageResults: true, participant: true, event: true },
  })

  return NextResponse.json(updated)
}
