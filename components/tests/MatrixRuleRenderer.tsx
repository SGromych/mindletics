"use client"

import { MatrixShapeCell } from "./MatrixShapeCell"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string) => void
}

export function MatrixRuleRenderer({ task, onAnswer }: Props) {
  const { grid_size, cells } = task.payload
  const [rows, cols] = grid_size
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any[] = task.options

  const grid: (typeof cells[0])[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  )
  for (const cell of cells) {
    grid[cell.row - 1][cell.col - 1] = cell
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg text-gray-300">{task.prompt_text}</p>

      <div
        className="inline-grid gap-1 rounded-xl bg-surface-card p-3"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {grid.flat().map((cell, i) => (
          <div key={i} className="flex items-center justify-center">
            <MatrixShapeCell cell={cell || { missing: true }} size={70} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(opt.key)}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface-card p-3 transition hover:bg-surface-light active:scale-95"
          >
            <MatrixShapeCell cell={opt} size={56} />
            <span className="text-sm font-bold text-gray-400">{opt.key}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
