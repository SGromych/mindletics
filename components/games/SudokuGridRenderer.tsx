"use client"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (v: string) => void
}

export function SudokuGridRenderer({ task, onAnswer }: Props) {
  const { grid, target_cell } = task.payload
  const [targetRow, targetCol] = target_cell as [number, number]
  const options: string[] = task.options

  const CELL = 42

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-bold text-center">{task.prompt_text}</p>

      <div
        className="inline-grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(9, ${CELL}px)`,
          gridTemplateRows: `repeat(9, ${CELL}px)`,
          border: "3px solid #888",
        }}
      >
        {grid.map((row: number[], r: number) =>
          row.map((val: number, c: number) => {
            const isTarget = r === targetRow && c === targetCol
            const rightBorder = (c + 1) % 3 === 0 && c < 8
            const bottomBorder = (r + 1) % 3 === 0 && r < 8

            return (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center text-lg font-bold ${
                  isTarget
                    ? "bg-accent/30 ring-2 ring-accent"
                    : val === 0
                      ? "bg-surface"
                      : "bg-surface-card"
                }`}
                style={{
                  width: CELL,
                  height: CELL,
                  borderRight: rightBorder ? "3px solid #888" : "1px solid #444",
                  borderBottom: bottomBorder ? "3px solid #888" : "1px solid #444",
                }}
              >
                {isTarget ? (
                  <span className="text-accent text-2xl font-black">?</span>
                ) : val !== 0 ? (
                  <span className="text-white">{val}</span>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      {/* Number options */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="min-h-btn rounded-xl bg-surface-card px-6 py-4 text-2xl font-black transition hover:bg-accent hover:text-black active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
