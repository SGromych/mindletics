"use client"

import { useEffect, useState } from "react"

interface EventItem {
  id: string
  eventName: string
  heatCount: number
}

interface FilterValues {
  scope: "all" | "last" | "event"
  eventId: string
  heat: string
  gender: string
  ageMin: string
  ageMax: string
  mode: string
}

interface FiltersProps {
  value: FilterValues
  onChange: (val: FilterValues) => void
}

export function Filters({ value, onChange }: FiltersProps) {
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents)
  }, [])

  const selectedEvent = events.find((e) => e.id === value.eventId)

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Scope tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-card p-1">
        {(["all", "last", "event"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onChange({ ...value, scope: s, heat: "" })}
            className={`rounded-md px-4 py-2 text-sm font-bold transition ${
              value.scope === s ? "bg-accent text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            {s === "all" ? "Все" : s === "last" ? "Последнее" : "По событию"}
          </button>
        ))}
      </div>

      {/* Event selector */}
      {value.scope === "event" && (
        <select
          value={value.eventId}
          onChange={(e) => onChange({ ...value, eventId: e.target.value, heat: "" })}
          className="rounded-lg bg-surface-card px-3 py-2 text-sm"
        >
          <option value="">Все события</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.eventName}</option>
          ))}
        </select>
      )}

      {/* Heat selector */}
      {value.scope === "event" && selectedEvent && selectedEvent.heatCount > 1 && (
        <select
          value={value.heat}
          onChange={(e) => onChange({ ...value, heat: e.target.value })}
          className="rounded-lg bg-surface-card px-3 py-2 text-sm"
        >
          <option value="">Все заходы</option>
          {Array.from({ length: selectedEvent.heatCount }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>Заход {i + 1}</option>
          ))}
        </select>
      )}

      {/* Mode filter */}
      <div className="flex gap-1 rounded-lg bg-surface-card p-1">
        {[
          { val: "", label: "Все" },
          { val: "cognitive", label: "Тесты" },
          { val: "games", label: "Шахматы+Судоку" },
        ].map((m) => (
          <button
            key={m.val}
            onClick={() => onChange({ ...value, mode: m.val })}
            className={`rounded-md px-3 py-2 text-sm font-bold transition ${
              value.mode === m.val ? "bg-accent text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Gender */}
      <div className="flex gap-1 rounded-lg bg-surface-card p-1">
        {["", "male", "female"].map((g) => (
          <button
            key={g}
            onClick={() => onChange({ ...value, gender: g })}
            className={`rounded-md px-3 py-2 text-sm font-bold transition ${
              value.gender === g ? "bg-accent text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            {g === "" ? "Все" : g === "male" ? "М" : "Ж"}
          </button>
        ))}
      </div>

      {/* Age range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Мин"
          value={value.ageMin}
          onChange={(e) => onChange({ ...value, ageMin: e.target.value })}
          className="w-20 rounded-lg bg-surface-card px-3 py-2 text-sm"
        />
        <span className="text-gray-500">—</span>
        <input
          type="number"
          placeholder="Макс"
          value={value.ageMax}
          onChange={(e) => onChange({ ...value, ageMax: e.target.value })}
          className="w-20 rounded-lg bg-surface-card px-3 py-2 text-sm"
        />
      </div>
    </div>
  )
}
