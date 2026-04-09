"use client"

import { useEffect, useState } from "react"
import { formatTime } from "@/lib/utils"

interface TimerProps {
  startedAt: string | Date | null
  stoppedAt?: string | Date | null
  penaltySec?: number
}

function computeElapsed(startedAt: string | Date | null, stoppedAt?: string | Date | null) {
  if (!startedAt) return 0
  const start = new Date(startedAt).getTime()
  const end = stoppedAt ? new Date(stoppedAt).getTime() : Date.now()
  return Math.max(0, Math.floor((end - start) / 1000))
}

export function Timer({ startedAt, stoppedAt, penaltySec = 0 }: TimerProps) {
  // Initialize with correct elapsed so the timer never flashes 0 when
  // remounted between stage transitions.
  const [elapsed, setElapsed] = useState(() => computeElapsed(startedAt, stoppedAt))

  useEffect(() => {
    if (!startedAt) return
    setElapsed(computeElapsed(startedAt, stoppedAt))
    if (stoppedAt) return
    const id = setInterval(() => {
      setElapsed(computeElapsed(startedAt, null))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt, stoppedAt])

  return (
    <div className="font-mono text-5xl font-black tracking-wider text-accent">
      {formatTime(elapsed + penaltySec)}
    </div>
  )
}
