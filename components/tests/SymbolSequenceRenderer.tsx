"use client"

import { useState, useEffect, useCallback } from "react"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string[]) => void
}

export function SymbolSequenceRenderer({ task, onAnswer }: Props) {
  const sequence: string[] = task.payload.shown_sequence
  const symbolSet: string[] = task.render.symbol_set
  const showDuration = 1200 // ms per symbol

  const [phase, setPhase] = useState<"show" | "recall">("show")
  const [showIndex, setShowIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (phase !== "show") return
    if (showIndex >= sequence.length) {
      setPhase("recall")
      return
    }
    const timer = setTimeout(() => setShowIndex((i) => i + 1), showDuration)
    return () => clearTimeout(timer)
  }, [phase, showIndex, sequence.length])

  const handleSelect = useCallback((symbol: string) => {
    setSelected((prev) => {
      const next = [...prev, symbol]
      if (next.length >= sequence.length) {
        setTimeout(() => onAnswer(next), 100)
      }
      return next
    })
  }, [sequence.length, onAnswer])

  const handleUndo = useCallback(() => {
    setSelected((prev) => prev.slice(0, -1))
  }, [])

  if (phase === "show") {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-lg text-gray-300">Запомните последовательность</p>
        <div className="text-8xl select-none animate-pulse">
          {showIndex < sequence.length ? sequence[showIndex] : ""}
        </div>
        <p className="text-sm text-gray-500">
          {showIndex + 1} / {sequence.length}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg text-gray-300">Воспроизведите последовательность</p>

      <div className="flex gap-2 min-h-[60px]">
        {selected.map((s, i) => (
          <span key={i} className="text-4xl">{s}</span>
        ))}
        {Array.from({ length: sequence.length - selected.length }).map((_, i) => (
          <span key={`empty-${i}`} className="text-4xl text-gray-600">_</span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {symbolSet.map((sym) => (
          <button
            key={sym}
            onClick={() => handleSelect(sym)}
            disabled={selected.length >= sequence.length}
            className="min-h-btn rounded-xl bg-surface-card text-3xl py-4 transition hover:bg-surface-light active:scale-95 disabled:opacity-50"
          >
            {sym}
          </button>
        ))}
      </div>

      {selected.length > 0 && selected.length < sequence.length && (
        <button
          onClick={handleUndo}
          className="rounded-xl bg-surface-card px-6 py-3 text-sm font-bold transition hover:bg-surface-light"
        >
          Отменить последний
        </button>
      )}
    </div>
  )
}
