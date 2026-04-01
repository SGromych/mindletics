"use client"

import { useEffect, useState } from "react"
import { formatTime } from "@/lib/utils"

interface TimerProps {
  startedAt: string | Date | null
  stoppedAt?: string | Date | null
}

export function Timer({ startedAt, stoppedAt }: TimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return

    const start = new Date(startedAt).getTime()

    if (stoppedAt) {
      setElapsed(Math.floor((new Date(stoppedAt).getTime() - start) / 1000))
      return
    }

    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt, stoppedAt])

  return (
    <div className="font-mono text-5xl font-black tracking-wider text-accent">
      {formatTime(elapsed)}
    </div>
  )
}
