import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const halls = await prisma.event.findMany({
    select: { hallName: true },
    distinct: ["hallName"],
    orderBy: { hallName: "asc" },
  })

  return NextResponse.json(halls.map((h) => h.hallName))
}
