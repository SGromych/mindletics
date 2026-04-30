"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { EXERCISE_OPTIONS } from "@/lib/exercises"

export function EventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ id: string; eventName: string } | null>(null)
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [halls, setHalls] = useState<string[]>([])
  const [hallMode, setHallMode] = useState<"select" | "new">("new")
  const [hallName, setHallName] = useState("")
  const [eventMode, setEventMode] = useState<"cognitive" | "chess" | "sudoku" | "chess_sudoku">("cognitive")
  const [gameTaskCount, setGameTaskCount] = useState(4)

  useEffect(() => {
    fetch("/api/halls")
      .then((r) => r.json())
      .then((data: string[]) => {
        setHalls(data)
        if (data.length > 0) setHallMode("select")
      })
      .catch(() => {})
  }, [])

  function toggleExercise(ex: string) {
    setSelectedExercises((prev) => {
      if (prev.includes(ex)) return prev.filter((e) => e !== ex)
      if (prev.length >= 3) return prev
      return [...prev, ex]
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedExercises.length !== 3) return
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hallName: hallMode === "select" ? hallName : form.get("hallNameNew"),
        eventName: form.get("eventName"),
        eventDate: form.get("eventDate"),
        exercises: selectedExercises,
        heatCount: Number(form.get("heatCount")) || 1,
        penaltySec: Number(form.get("penaltySec")) || 15,
        mode: eventMode,
        gameTaskCount: eventMode !== "cognitive" ? gameTaskCount : undefined,
      }),
    })

    if (res.ok) {
      const event = await res.json()
      setCreated(event)
    }
    setLoading(false)
  }

  if (created) {
    return (
      <Card className="w-full max-w-lg text-center">
        <h2 className="mb-4 text-2xl font-bold text-accent">Событие создано!</h2>
        <p className="mb-6 text-xl">{created.eventName}</p>
        <div className="flex gap-4">
          <Button variant="secondary" fullWidth onClick={() => router.push("/")}>
            Главная
          </Button>
          <Button fullWidth onClick={() => router.push(`/live/${created.id}`)}>
            Live табло
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold">Создать событие</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-5">
        {/* Mode selector */}
        <div className="col-span-2 flex flex-col gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-400">Режим</span>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "cognitive" as const, icon: "🧠", label: "Когнитивные тесты", desc: "Логика, память, реакция" },
              { key: "chess" as const, icon: "♔", label: "Шахматы", desc: "Только шахматные задачи" },
              { key: "sudoku" as const, icon: "🔢", label: "Судоку", desc: "Только задачи судоку" },
              { key: "chess_sudoku" as const, icon: "♟️", label: "Шахматы + Судоку", desc: "Шахматные задачи и судоку" },
            ]).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setEventMode(m.key)}
                className={`flex items-center gap-3 rounded-xl px-5 py-4 text-left font-bold transition ring-1 ${
                  eventMode === m.key
                    ? "bg-accent/20 ring-2 ring-accent text-white"
                    : "bg-white/5 ring-white/20 text-gray-400 hover:bg-white/10"
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <div className="text-base">{m.label}</div>
                  <div className="text-xs font-normal text-gray-500">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {eventMode !== "cognitive" && (
            <label className="flex items-center gap-3 mt-2">
              <span className="text-sm font-semibold text-gray-400">Заданий на станцию:</span>
              <input
                type="number"
                min={2}
                max={8}
                value={gameTaskCount}
                onChange={(e) => setGameTaskCount(Math.max(2, Math.min(8, Number(e.target.value) || 4)))}
                className="w-20 min-h-[44px] rounded-xl bg-surface px-3 text-lg text-center outline-none ring-1 ring-white/20 focus:ring-accent"
              />
            </label>
          )}
        </div>

        {/* Hall name */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Зал</span>
          {hallMode === "select" && halls.length > 0 ? (
            <select
              value={hallName}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setHallMode("new")
                  setHallName("")
                } else {
                  setHallName(e.target.value)
                }
              }}
              required
              className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
            >
              <option value="">Выберите зал...</option>
              {halls.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
              <option value="__new__">+ Создать новый зал</option>
            </select>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                name="hallNameNew"
                required
                placeholder="Название нового зала"
                className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
              />
              {halls.length > 0 && (
                <button type="button" onClick={() => setHallMode("select")} className="self-start text-sm font-semibold text-accent hover:underline">
                  ← Выбрать из списка
                </button>
              )}
            </div>
          )}
        </label>

        {/* Event name */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Название события</span>
          <input
            name="eventName"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>

        {/* Date */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Дата</span>
          <input
            name="eventDate"
            type="date"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>

        {/* Heat count */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Количество заходов</span>
          <input
            name="heatCount"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>

        {/* Penalty */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Штраф за ошибку (сек)</span>
          <input
            name="penaltySec"
            type="number"
            min={5}
            max={60}
            defaultValue={15}
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>

        {/* Spacer for grid alignment */}
        <div />

        {/* Exercises — full width */}
        <div className="col-span-2 flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">
            Упражнения (выберите 3 по порядку: Этап 2 → Этап 4 → Этап 6)
          </span>
          <p className="text-xs text-gray-500">
            Выбрано: {selectedExercises.length}/3
            {selectedExercises.length > 0 && (
              <span>
                {" — "}
                {selectedExercises.map((ex, i) => (
                  <span key={ex}>
                    <span className="text-accent">Этап {(i + 1) * 2}:</span> {ex}
                    {i < selectedExercises.length - 1 && " → "}
                  </span>
                ))}
              </span>
            )}
          </p>
          <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto rounded-xl bg-surface p-3 ring-1 ring-white/20">
            {EXERCISE_OPTIONS.map((ex) => {
              const isSelected = selectedExercises.includes(ex)
              const order = selectedExercises.indexOf(ex) + 1

              return (
                <button
                  key={ex}
                  type="button"
                  onClick={() => toggleExercise(ex)}
                  className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    isSelected
                      ? "bg-accent/20 ring-2 ring-accent text-white"
                      : selectedExercises.length >= 3
                        ? "bg-white/5 text-gray-600 cursor-not-allowed"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {isSelected && <span className="mr-1 text-accent font-bold">{order}.</span>}
                  {ex}
                </button>
              )
            })}
          </div>
        </div>

        <div className="col-span-2">
          <Button type="submit" fullWidth disabled={loading || selectedExercises.length !== 3}>
            {loading ? "Создание..." : "Создать событие"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
