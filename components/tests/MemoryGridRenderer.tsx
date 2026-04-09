"use client"

import { useState, useEffect, useCallback } from "react"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: number[][]) => void
}

export function MemoryGridRenderer({ task, onAnswer }: Props) {
  const gridSize: number = task.render.grid_size || 6
  const memorizeTime: number = task.render.memorize_time_sec || 4
  const cells: number[][] = task.payload.cells_to_memorize
  const maxSelections = cells.length

  const [phase, setPhase] = useState<"memorize" | "recall">("memorize")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setPhase("recall"), memorizeTime * 1000)
    return () => clearTimeout(timer)
  }, [memorizeTime])

  const cellSet = new Set(cells.map((c) => `${c[0]},${c[1]}`))

  const toggleCell = useCallback((row: number, col: number) => {
    if (phase !== "recall") return
    setSelected((prev) => {
      const key = `${row},${col}`
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else if (next.size < maxSelections) {
        next.add(key)
      }
      return next
    })
  }, [phase, maxSelections])

  const handleSubmit = useCallback(() => {
    const result = Array.from(selected).map((key) => key.split(",").map(Number))
    onAnswer(result)
  }, [selected, onAnswer])

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-gray-300">
        {phase === "memorize" ? "Запомните отмеченные клетки..." : "Выберите запомненные клетки"}
      </p>

      <div
        className="inline-grid gap-0.5 rounded-lg bg-surface-card p-2"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: gridSize }).map((_, row) =>
          Array.from({ length: gridSize }).map((_, col) => {
            const r = row + 1
            const c = col + 1
            const key = `${r},${c}`
            const isTarget = cellSet.has(key)
            const isSelected = selected.has(key)

            return (
              <button
                key={key}
                onClick={() => toggleCell(r, c)}
                disabled={phase === "memorize"}
                className={`w-14 h-14 rounded-md transition ${
                  phase === "memorize"
                    ? isTarget
                      ? "bg-accent"
                      : "bg-white/10"
                    : isSelected
                      ? "bg-accent"
                      : "bg-white/10 hover:bg-white/20"
                }`}
              />
            )
          })
        )}
      </div>

      {phase === "recall" && (
        <button
          onClick={handleSubmit}
          className="min-h-btn rounded-xl bg-accent px-10 py-4 text-lg font-bold text-white transition hover:bg-accent/80 active:scale-95"
        >
          Подтвердить ({selected.size}/{cells.length})
        </button>
      )}
    </div>
  )
}
