"use client"

import { useState, useEffect, useCallback } from "react"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string[]) => void
}

export function ObjectRecognitionRenderer({ task, onAnswer }: Props) {
  const shownItems: string[] = task.payload.shown_items
  const selectableItems: string[] = task.payload.selectable_items
  const memorizeTime: number = task.render.memorize_time_sec || 4

  const [phase, setPhase] = useState<"memorize" | "recall">("memorize")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setPhase("recall"), memorizeTime * 1000)
    return () => clearTimeout(timer)
  }, [memorizeTime])

  const toggleItem = useCallback((item: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    onAnswer(Array.from(selected))
  }, [selected, onAnswer])

  if (phase === "memorize") {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-lg text-gray-300">Запомните эти символы...</p>
        <div className="flex flex-wrap justify-center gap-4">
          {shownItems.map((item, i) => (
            <span key={i} className="text-5xl select-none">{item}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg text-gray-300">Выберите символы, которые были показаны</p>

      <div className="grid grid-cols-5 gap-3 w-full max-w-md">
        {selectableItems.map((item) => (
          <button
            key={item}
            onClick={() => toggleItem(item)}
            className={`rounded-xl py-4 text-3xl transition active:scale-95 ${
              selected.has(item)
                ? "bg-accent ring-2 ring-accent"
                : "bg-surface-card hover:bg-surface-light"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="min-h-btn rounded-xl bg-accent px-10 py-4 text-lg font-bold text-white transition hover:bg-accent/80 active:scale-95"
      >
        Подтвердить ({selected.size}/{shownItems.length})
      </button>
    </div>
  )
}
