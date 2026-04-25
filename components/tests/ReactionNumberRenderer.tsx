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

type Effect = "move" | "highlight" | "spin" | "shake" | "blink" | "scale_pulse" | "none"

const EFFECT_POOL: Effect[] = ["move", "move", "highlight", "highlight", "spin", "shake", "blink", "scale_pulse", "none", "move", "blink", "none"]

export function ReactionNumberRenderer({ task, onAnswer }: Props) {
  const target: string = task.payload.target
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOptions: any[] = task.payload.options

  const displayOptions = useMemo(() => {
    const values = rawOptions.map((o) => o.value as string)
    const shuffled = shuffle(values)
    const effects = shuffle([...EFFECT_POOL]).slice(0, shuffled.length)
    const colorPool = shuffle(HIGHLIGHT_COLORS)
    let colorIdx = 0
    return shuffled.map((value, i) => ({
      value,
      effect: effects[i],
      color: effects[i] === "highlight" ? colorPool[colorIdx++ % colorPool.length] : undefined,
    }))
  }, [rawOptions])

  const gridCols = displayOptions.length > 9 ? "grid-cols-4" : "grid-cols-3"

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg text-gray-300">{task.prompt_text}</p>

      <div className="rounded-xl bg-surface-card px-8 py-4">
        <span className="text-3xl font-mono font-bold text-accent">Найдите: {target}</span>
      </div>

      <div className={`grid ${gridCols} gap-3 w-full max-w-xl`}>
        {displayOptions.map((opt) => {
          let animClass = ""
          const style: React.CSSProperties = {}

          switch (opt.effect) {
            case "move":
              animClass = "animate-bounce"
              break
            case "highlight":
              if (opt.color) {
                style.backgroundColor = opt.color
                style.color = "#fff"
              }
              break
            case "spin":
              style.animation = "spin 3s linear infinite"
              break
            case "shake":
              style.animation = "shake 0.5s ease-in-out infinite"
              break
            case "blink":
              style.animation = "blink 1s ease-in-out infinite"
              break
            case "scale_pulse":
              style.animation = "scale-pulse 1.2s ease-in-out infinite"
              break
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

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
