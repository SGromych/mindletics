"use client"

import { useMemo } from "react"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string) => void
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const HIGHLIGHT_COLORS = ["#f97316", "#ec4899", "#14b8a6", "#eab308", "#a855f7"]

type Effect = "move" | "highlight" | "none"

export function ReactionNumberRenderer({ task, onAnswer }: Props) {
  const target: string = task.payload.target
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOptions: any[] = task.payload.options

  const displayOptions = useMemo(() => {
    // Randomize effect distribution: 2 move, 2 highlight, 2 plain.
    // Target digit can end up in any group.
    const values = rawOptions.map((o) => o.value as string)
    const shuffled = shuffle(values)
    const effects: Effect[] = []
    for (let i = 0; i < shuffled.length; i++) {
      if (i < 2) effects.push("move")
      else if (i < 4) effects.push("highlight")
      else effects.push("none")
    }
    const colorPool = shuffle(HIGHLIGHT_COLORS)
    let colorIdx = 0
    return shuffled.map((value, i) => ({
      value,
      effect: effects[i],
      color: effects[i] === "highlight" ? colorPool[colorIdx++ % colorPool.length] : undefined,
    }))
  }, [rawOptions])

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg text-gray-300">{task.prompt_text}</p>

      <div className="rounded-xl bg-surface-card px-8 py-4">
        <span className="text-3xl font-mono font-bold text-accent">Найдите: {target}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        {displayOptions.map((opt) => {
          const animClass = opt.effect === "move" ? "animate-bounce" : ""
          const style: React.CSSProperties = {}
          if (opt.effect === "highlight" && opt.color) {
            style.backgroundColor = opt.color
            style.color = "#fff"
          }
          return (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              style={style}
              className={`min-h-btn rounded-xl px-4 py-5 text-2xl font-mono font-bold transition active:scale-95 ${
                opt.effect === "highlight" ? "" : "bg-surface-card hover:bg-surface-light"
              } ${animClass}`}
            >
              {opt.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
