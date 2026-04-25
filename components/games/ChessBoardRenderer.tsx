"use client"

// Unicode chess pieces by FEN char
const PIECE_MAP: Record<string, string> = {
  K: "\u2654", Q: "\u2655", R: "\u2656", B: "\u2657", N: "\u2658", P: "\u2659",
  k: "\u265A", q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E", p: "\u265F",
}

function parseFen(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/")
  const board: (string | null)[][] = []
  for (const row of rows) {
    const rank: (string | null)[] = []
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") {
        for (let i = 0; i < parseInt(ch); i++) rank.push(null)
      } else {
        rank.push(ch)
      }
    }
    board.push(rank)
  }
  return board
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (v: string) => void
}

export function ChessBoardRenderer({ task, onAnswer }: Props) {
  const { fen, orientation } = task.payload
  const board = parseFen(fen)
  const options: string[] = task.options

  const isFlipped = orientation === "black"
  const displayBoard = isFlipped ? [...board].reverse().map((r) => [...r].reverse()) : board

  const CELL = 48
  const BOARD = CELL * 8
  const files = isFlipped ? "hgfedcba" : "abcdefgh"
  const ranks = isFlipped ? "12345678" : "87654321"

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-bold text-center">{task.prompt_text}</p>
      <p className="text-sm text-gray-400">
        {orientation === "white" ? "Ход белых" : "Ход чёрных"}
      </p>

      <svg width={BOARD + 32} height={BOARD + 32} viewBox={`0 0 ${BOARD + 32} ${BOARD + 32}`} className="mx-auto">
        {/* Rank labels */}
        {ranks.split("").map((r, i) => (
          <text key={`rank-${r}`} x={8} y={20 + i * CELL + CELL / 2} textAnchor="middle" fill="#888" fontSize={12} dominantBaseline="central">
            {r}
          </text>
        ))}
        {/* File labels */}
        {files.split("").map((f, i) => (
          <text key={`file-${f}`} x={20 + i * CELL + CELL / 2} y={BOARD + 28} textAnchor="middle" fill="#888" fontSize={12}>
            {f}
          </text>
        ))}

        {/* Board squares and pieces */}
        {displayBoard.map((row, r) =>
          row.map((piece, c) => {
            const isLight = (r + c) % 2 === 0
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={20 + c * CELL}
                  y={4 + r * CELL}
                  width={CELL}
                  height={CELL}
                  fill={isLight ? "#f0d9b5" : "#b58863"}
                />
                {piece && (
                  <text
                    x={20 + c * CELL + CELL / 2}
                    y={4 + r * CELL + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={CELL * 0.7}
                    fill={piece === piece.toUpperCase() ? "#fff" : "#222"}
                    style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))" }}
                  >
                    {PIECE_MAP[piece] || ""}
                  </text>
                )}
              </g>
            )
          })
        )}
      </svg>

      {/* Move options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="min-h-btn rounded-xl bg-surface-card px-6 py-4 text-lg font-bold transition hover:bg-accent hover:text-black active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
