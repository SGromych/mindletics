"use client"

export function TopViewGrid({
  cells,
  size = 100,
  highlight = false,
}: {
  cells: number[][]
  size?: number
  highlight?: boolean
}) {
  // Cells come as [x, y] — same convention as 3D blocks [x, y, z].
  // Render x → horizontal (col, right), y → vertical (row, down)
  // so the top view matches the isometric view's coordinate system.
  const maxX = Math.max(...cells.map((c) => c[0]), 0) + 1
  const maxY = Math.max(...cells.map((c) => c[1]), 0) + 1
  const gridSize = Math.max(maxX, maxY, 3)
  const cellSize = size / gridSize

  const cellSet = new Set(cells.map((c) => `${c[0]},${c[1]}`))

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: gridSize }).map((_, row) =>
        Array.from({ length: gridSize }).map((_, col) => {
          // col is x, row is y
          const filled = cellSet.has(`${col},${row}`)
          return (
            <rect
              key={`${row}-${col}`}
              x={col * cellSize}
              y={row * cellSize}
              width={cellSize}
              height={cellSize}
              fill={filled ? (highlight ? "#818cf8" : "#6366f1") : "transparent"}
              stroke="#4b5563"
              strokeWidth="0.5"
            />
          )
        })
      )}
    </svg>
  )
}
