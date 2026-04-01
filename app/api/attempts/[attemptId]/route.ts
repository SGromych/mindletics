import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { attemptId: string } }) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: {
      stageResults: { orderBy: { stageNo: "asc" } },
      participant: true,
      event: true,
    },
  })

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }

  return NextResponse.json(attempt)
}
