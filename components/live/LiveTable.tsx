"use client"

import { useEffect, useState } from "react"
import { StatusBadge } from "./StatusBadge"
import { formatTime } from "@/lib/utils"

interface LiveRow {
  rank: number
  attemptId: string
  displayName: string
  bibNumber: string
  heatNumber: number
  status: string
  currentStageNo: number
  currentStageTitle: string
  totalTimeSec: number
  penaltyTimeSec: number
  startedAt: string | null
}

interface LiveData {
  event: { eventName: string; hallName: string; eventDate: string; heatCount: number; mode?: string }
  participants: LiveRow[]
}

export function LiveTable({ eventId }: { eventId: string }) {
  const [data, setData] = useState<LiveData | null>(null)
  const [heatFilter, setHeatFilter] = useState("")

  useEffect(() => {
    let active = true

    async function poll() {
      try {
        const url = heatFilter
          ? `/api/live/${eventId}?heat=${heatFilter}`
          : `/api/live/${eventId}`
        const res = await fetch(url)
        if (res.ok && active) setData(await res.json())
      } catch { /* ignore */ }
    }

    poll()
    const id = setInterval(poll, 2000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [eventId, heatFilter])

  if (!data) {
    return <div className="flex items-center justify-center py-12 text-xl">Загрузка...</div>
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black">{data.event.eventName}</h1>
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-400">{data.event.hallName}</p>
          {data.event.mode === "games" && (
            <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-400">
              Шахматы + Судоку
            </span>
          )}
        </div>
      </div>

      {data.event.heatCount > 1 && (
        <div className="mb-4 flex items-center justify-center gap-1 rounded-lg bg-surface-card p-1">
          <button
            onClick={() => setHeatFilter("")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${!heatFilter ? "bg-accent text-black" : "text-gray-400 hover:text-white"}`}
          >
            Все
          </button>
          {Array.from({ length: data.event.heatCount }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setHeatFilter(String(i + 1))}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${heatFilter === String(i + 1) ? "bg-accent text-black" : "text-gray-400 hover:text-white"}`}
            >
              Заход {i + 1}
            </button>
          ))}
        </div>
      )}

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10 text-sm font-semibold uppercase text-gray-400">
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Номер</th>
            <th className="px-3 py-3">Имя</th>
            {data.event.heatCount > 1 && <th className="px-3 py-3">Заход</th>}
            <th className="px-3 py-3">Статус</th>
            <th className="px-3 py-3">Этап</th>
            <th className="px-3 py-3 text-right">Время</th>
          </tr>
        </thead>
        <tbody>
          {data.participants.map((p) => (
            <tr key={p.attemptId} className="border-b border-white/5 transition hover:bg-white/5">
              <td className="px-3 py-4 text-lg font-bold">{p.rank}</td>
              <td className="px-3 py-4 font-mono">{p.bibNumber}</td>
              <td className="px-3 py-4 font-bold">{p.displayName}</td>
              {data.event.heatCount > 1 && <td className="px-3 py-4 text-sm">{p.heatNumber}</td>}
              <td className="px-3 py-4">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-3 py-4 text-sm">
                {p.status === "finished"
                  ? "Финиш"
                  : p.status === "aborted"
                    ? "Прервано"
                    : `${p.currentStageNo}/6 ${p.currentStageTitle}` || "—"}
              </td>
              <td className="px-3 py-4 text-right font-mono">
                <LiveTimer status={p.status} startedAt={p.startedAt} totalTimeSec={p.totalTimeSec} penaltyTimeSec={p.penaltyTimeSec} />
              </td>
            </tr>
          ))}
          {data.participants.length === 0 && (
            <tr>
              <td colSpan={data.event.heatCount > 1 ? 7 : 6} className="px-3 py-8 text-center text-gray-500">
                Пока нет участников
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function LiveTimer({ status, startedAt, totalTimeSec, penaltyTimeSec }: {
  status: string; startedAt: string | null; totalTimeSec: number; penaltyTimeSec: number
}) {
  const [elapsed, setElapsed] = useState(totalTimeSec)

  useEffect(() => {
    if (status !== "in_progress" || !startedAt) {
      setElapsed(totalTimeSec)
      return
    }
    const tick = () => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) + penaltyTimeSec)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, startedAt, totalTimeSec, penaltyTimeSec])

  return <>{formatTime(elapsed)}</>
}
