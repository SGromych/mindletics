"use client"

const COLOR_LABELS: Record<string, string> = {
  red: "Красный",
  blue: "Синий",
  green: "Зелёный",
  yellow: "Жёлтый",
  black: "Чёрный",
  purple: "Фиолетовый",
}

const COLOR_CSS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  black: "#1f2937",
  purple: "#a855f7",
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string) => void
}

export function StroopRenderer({ task, onAnswer }: Props) {
  const { word, ink_color } = task.payload
  const options: string[] = task.options

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-lg text-gray-300">{task.prompt_text}</p>

      <div
        className="text-6xl font-black select-none"
        style={{ color: COLOR_CSS[ink_color] || ink_color }}
      >
        {word}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="min-h-btn rounded-xl px-4 py-4 text-lg font-bold transition active:scale-95"
            style={{
              backgroundColor: COLOR_CSS[opt] || opt,
              color: opt === "yellow" ? "#000" : "#fff",
            }}
          >
            {COLOR_LABELS[opt] || opt}
          </button>
        ))}
      </div>
    </div>
  )
}
