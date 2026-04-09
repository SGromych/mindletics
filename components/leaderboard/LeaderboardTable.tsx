"use client"

import { StatusBadge } from "@/components/live/StatusBadge"
import { formatTime } from "@/lib/utils"

interface Row {
  rank: number
  displayName: string
  bibNumber: string
  gender: string
  age: number
  eventName: string
  status: string
  totalTimeSec: number
  penaltyTimeSec: number
}

export function LeaderboardTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10 text-sm font-semibold uppercase text-gray-400">
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Номер</th>
            <th className="px-3 py-3">Имя</th>
            <th className="px-3 py-3">Пол</th>
            <th className="px-3 py-3">Возраст</th>
            <th className="px-3 py-3">Событие</th>
            <th className="px-3 py-3">Статус</th>
            <th className="px-3 py-3 text-right">Время</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rank + r.bibNumber} className="border-b border-white/5 transition hover:bg-white/5">
              <td className="px-3 py-4 text-lg font-bold">{r.rank}</td>
              <td className="px-3 py-4 font-mono">{r.bibNumber}</td>
              <td className="px-3 py-4 font-bold">{r.displayName}</td>
              <td className="px-3 py-4 text-sm">{r.gender === "male" ? "М" : "Ж"}</td>
              <td className="px-3 py-4">{r.age}</td>
              <td className="px-3 py-4 text-sm text-gray-400">{r.eventName}</td>
              <td className="px-3 py-4"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-4 text-right font-mono">{formatTime(r.totalTimeSec)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                Пока нет результатов
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
