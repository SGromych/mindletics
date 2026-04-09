"use client"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string) => void
}

export function NumberSequenceRenderer({ task, onAnswer }: Props) {
  const sequence: string[] = task.payload.sequence
  const options: string[] = task.options

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-lg text-gray-300">{task.prompt_text}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {sequence.map((val, i) => (
          <span
            key={i}
            className={`rounded-xl px-5 py-3 text-2xl font-bold ${
              val === "?" ? "bg-accent/30 text-accent" : "bg-surface-card"
            }`}
          >
            {val}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="min-h-btn rounded-xl bg-surface-card px-4 py-4 text-xl font-bold transition hover:bg-surface-light active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
