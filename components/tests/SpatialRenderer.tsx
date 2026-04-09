"use client"

import { IsometricRenderer } from "./IsometricRenderer"
import { TopViewGrid } from "./TopViewGrid"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string) => void
}

export function SpatialRenderer({ task, onAnswer }: Props) {
  const blocks: number[][] = task.payload.blocks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any[] = task.options

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg text-gray-300">{task.prompt_text}</p>

      <div className="rounded-xl bg-surface-card p-4">
        <IsometricRenderer blocks={blocks} size={300} />
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(opt.key)}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface-card p-3 transition hover:bg-surface-light active:scale-95"
          >
            <TopViewGrid cells={opt.cells} size={80} />
            <span className="text-sm font-bold text-gray-400">{opt.key}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
