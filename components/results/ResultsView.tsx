"use client"

import { useEffect, useState } from "react"
import { formatTime } from "@/lib/utils"

/* ---------- types ---------- */

interface EventItem {
  id: string
  eventName: string
  hallName: string
  heatCount: number
  penaltySec: number
  eventDate: string
}

interface ParticipantRow {
  attemptId: string
  displayName: string
  fullName: string
  bibNumber: string
  heatNumber: number
  status: string
  totalTimeSec: number
  penaltyTimeSec: number
}

interface RawAnswer {
  taskIndex: number
  taskId?: string
  taskType: string
  wasCorrect: boolean
  responseTimeMs: number
  selectedOption: string | number | null
  correctOption: string | number | null
  partialErrors?: number
}

interface StageResultItem {
  id: string
  stageNo: number
  stageType: string
  stageTitle: string
  durationSec: number | null
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  penaltySec: number
  rawAnswersJson: RawAnswer[] | null
}

interface AttemptDetail {
  id: string
  status: string
  totalTimeSec: number
  penaltyTimeSec: number
  totalCorrect: number
  totalWrong: number
  participant: {
    firstName: string
    lastName: string
    bibNumber: string
    birthDate: string
    gender: string
    heatNumber: number
  }
  event: {
    eventName: string
    hallName: string
    penaltySec: number
  }
  stageResults: StageResultItem[]
}

/* ---------- component ---------- */

export function ResultsView() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedHeat, setSelectedHeat] = useState<number | "">("")
  const [participants, setParticipants] = useState<ParticipantRow[]>([])
  const [selectedAttemptId, setSelectedAttemptId] = useState("")
  const [detail, setDetail] = useState<AttemptDetail | null>(null)
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  // selected event object
  const selectedEvent = events.find((e) => e.id === selectedEventId)

  /* fetch events */
  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
  }, [])

  /* fetch participants when event (and optionally heat) changes */
  useEffect(() => {
    if (!selectedEventId) {
      setParticipants([])
      setSelectedAttemptId("")
      setDetail(null)
      return
    }
    setSelectedAttemptId("")
    setDetail(null)
    setLoading(true)

    const params = new URLSearchParams({ eventId: selectedEventId })
    if (selectedHeat !== "") params.set("heat", String(selectedHeat))

    fetch(`/api/results?${params}`)
      .then((r) => r.json())
      .then((data) => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false))
  }, [selectedEventId, selectedHeat])

  /* fetch detail when attempt selected */
  useEffect(() => {
    if (!selectedAttemptId) {
      setDetail(null)
      return
    }
    setLoading(true)
    setExpandedStages(new Set())

    fetch(`/api/results?attemptId=${selectedAttemptId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [selectedAttemptId])

  /* reset heat when event changes */
  useEffect(() => {
    setSelectedHeat("")
  }, [selectedEventId])

  function toggleStage(stageNo: number) {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stageNo)) next.delete(stageNo)
      else next.add(stageNo)
      return next
    })
  }

  /* ---------- render ---------- */

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Cascade selectors */}
      <div className="no-print mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Event selector */}
        <div>
          <label className="mb-1 block text-sm text-white/60">Мероприятие</label>
          <select
            className="w-full rounded-lg border border-white/10 bg-surface-card px-4 py-3 text-white"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">— Выберите —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.eventName} — {ev.hallName} ({new Date(ev.eventDate).toLocaleDateString("ru-RU")})
              </option>
            ))}
          </select>
        </div>

        {/* Heat selector (only if heatCount > 1) */}
        {selectedEvent && selectedEvent.heatCount > 1 && (
          <div>
            <label className="mb-1 block text-sm text-white/60">Заезд</label>
            <select
              className="w-full rounded-lg border border-white/10 bg-surface-card px-4 py-3 text-white"
              value={selectedHeat}
              onChange={(e) => setSelectedHeat(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Все заезды</option>
              {Array.from({ length: selectedEvent.heatCount }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Заезд {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Participant selector */}
        {selectedEventId && (
          <div>
            <label className="mb-1 block text-sm text-white/60">Участник</label>
            <select
              className="w-full rounded-lg border border-white/10 bg-surface-card px-4 py-3 text-white"
              value={selectedAttemptId}
              onChange={(e) => setSelectedAttemptId(e.target.value)}
            >
              <option value="">— Выберите —</option>
              {participants.map((p) => (
                <option key={p.attemptId} value={p.attemptId}>
                  #{p.bibNumber} {p.fullName} ({p.status === "finished" ? "Финиш" : "Сход"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <p className="text-white/40">Загрузка...</p>}

      {/* Detail view */}
      {detail && (
        <div className="space-y-6">
          {/* Header card */}
          <div className="rounded-xl bg-surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {detail.participant.lastName} {detail.participant.firstName}
                </h2>
                <p className="text-white/60">
                  Номер: <span className="font-mono text-white">{detail.participant.bibNumber}</span>
                  {detail.participant.heatNumber > 0 && (
                    <> &middot; Заезд {detail.participant.heatNumber}</>
                  )}
                </p>
                <p className="text-white/60">
                  {detail.event.eventName} — {detail.event.hallName}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    detail.status === "finished"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {detail.status === "finished" ? "Финиш" : "Сход"}
                </span>
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Общее время" value={formatTime(detail.totalTimeSec)} />
            <SummaryCard label="Правильных" value={String(detail.totalCorrect)} color="green" />
            <SummaryCard label="Ошибок" value={String(detail.totalWrong)} color="red" />
            <SummaryCard label="Штраф" value={formatTime(detail.penaltyTimeSec)} color="yellow" />
          </div>

          {/* Stages table */}
          <div className="overflow-x-auto rounded-xl bg-surface-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Этап</th>
                  <th className="px-4 py-3">Тип</th>
                  <th className="px-4 py-3 font-mono">Время</th>
                  <th className="px-4 py-3 text-green-400">Верно</th>
                  <th className="px-4 py-3 text-red-400">Ошибки</th>
                  <th className="px-4 py-3">Штраф</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {detail.stageResults.map((sr) => {
                  const isCognitive = sr.stageType === "cognitive"
                  const expanded = expandedStages.has(sr.stageNo)
                  const answers: RawAnswer[] = Array.isArray(sr.rawAnswersJson)
                    ? sr.rawAnswersJson
                    : []

                  return (
                    <StageRow
                      key={sr.id}
                      sr={sr}
                      isCognitive={isCognitive}
                      expanded={expanded}
                      answers={answers}
                      onToggle={() => toggleStage(sr.stageNo)}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Print button */}
          <div className="no-print flex justify-end">
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-white/10 px-6 py-3 font-medium text-white hover:bg-white/20"
            >
              Печать / PDF
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- sub-components ---------- */

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: "green" | "red" | "yellow"
}) {
  const colorClass =
    color === "green"
      ? "text-green-400"
      : color === "red"
        ? "text-red-400"
        : color === "yellow"
          ? "text-yellow-400"
          : "text-white"

  return (
    <div className="rounded-xl bg-surface-card p-4 text-center">
      <p className="text-sm text-white/60">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}

function StageRow({
  sr,
  isCognitive,
  expanded,
  answers,
  onToggle,
}: {
  sr: StageResultItem
  isCognitive: boolean
  expanded: boolean
  answers: RawAnswer[]
  onToggle: () => void
}) {
  return (
    <>
      <tr
        className={`border-b border-white/5 ${isCognitive ? "cursor-pointer hover:bg-white/5" : ""}`}
        onClick={isCognitive ? onToggle : undefined}
      >
        <td className="px-4 py-3 font-mono">{sr.stageNo}</td>
        <td className="px-4 py-3">{sr.stageTitle}</td>
        <td className="px-4 py-3 text-white/60">
          {sr.stageType === "cognitive" ? "Когнитивный" : "Физический"}
        </td>
        <td className="px-4 py-3 font-mono">{sr.durationSec != null ? formatTime(sr.durationSec) : "—"}</td>
        <td className="px-4 py-3 text-green-400">{sr.correctAnswers}</td>
        <td className="px-4 py-3 text-red-400">{sr.wrongAnswers}</td>
        <td className="px-4 py-3 font-mono">{sr.penaltySec > 0 ? `+${sr.penaltySec}s` : "—"}</td>
        <td className="px-4 py-3 text-white/40">
          {isCognitive && answers.length > 0 && (expanded ? "▲" : "▼")}
        </td>
      </tr>

      {/* Expanded answers */}
      {isCognitive && expanded && answers.length > 0 && (
        <tr>
          <td colSpan={8} className="bg-white/[0.02] px-4 py-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-white/40">
                  <th className="px-2 py-1">Задание</th>
                  <th className="px-2 py-1">Тип</th>
                  <th className="px-2 py-1">Результат</th>
                  <th className="px-2 py-1 font-mono">Время</th>
                  <th className="px-2 py-1">Выбрано</th>
                  <th className="px-2 py-1">Правильно</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((a, idx) => (
                  <tr key={idx} className="border-t border-white/5">
                    <td className="px-2 py-1 font-mono">{a.taskIndex + 1}</td>
                    <td className="px-2 py-1 text-white/60">{a.taskType}</td>
                    <td className="px-2 py-1">
                      {a.wasCorrect ? (
                        <span className="text-green-400">&#10003;</span>
                      ) : (
                        <span className="text-red-400">&#10007;</span>
                      )}
                    </td>
                    <td className="px-2 py-1 font-mono">{a.responseTimeMs}ms</td>
                    <td className="px-2 py-1 text-white/60">{formatOption(a.selectedOption)}</td>
                    <td className="px-2 py-1 text-white/60">{formatOption(a.correctOption)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  )
}

function formatOption(val: string | number | null): string {
  if (val === null || val === undefined) return "—"
  return String(val)
}
