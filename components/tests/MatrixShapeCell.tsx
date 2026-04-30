"use client"

interface CellData {
  shape?: string
  fill?: string
  rotation_deg?: number
  count?: number
  size?: string // "small" | "medium" | "large"
  missing?: boolean
}

function renderShape(
  shape: string,
  fill: string,
  rotation_deg: number,
  cx: number,
  cy: number,
  scale: number,
  patternId: string
) {
  const fillColor = fill === "solid" ? "#e2e8f0" : "none"
  const strokeColor = "#e2e8f0"
  const useFill = fill === "striped" ? `url(#${patternId})` : fillColor

  const r = 22 * scale
  const halfSide = 22 * scale

  return (
    <g transform={`rotate(${rotation_deg} ${cx} ${cy})`}>
      {shape === "circle" && (
        <circle cx={cx} cy={cy} r={r} fill={useFill} stroke={strokeColor} strokeWidth="2" />
      )}
      {shape === "square" && (
        <rect
          x={cx - halfSide}
          y={cy - halfSide}
          width={halfSide * 2}
          height={halfSide * 2}
          rx="3"
          fill={useFill}
          stroke={strokeColor}
          strokeWidth="2"
        />
      )}
      {shape === "triangle" && (
        <polygon
          points={`${cx},${cy - r} ${cx + r * 0.87},${cy + r * 0.5} ${cx - r * 0.87},${cy + r * 0.5}`}
          fill={useFill}
          stroke={strokeColor}
          strokeWidth="2"
        />
      )}
    </g>
  )
}

export function MatrixShapeCell({ cell, size = 60 }: { cell: CellData; size?: number }) {
  if (cell.missing) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <rect x="2" y="2" width="56" height="56" rx="6" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3" />
        <text x="30" y="36" textAnchor="middle" fill="#6366f1" fontSize="24" fontWeight="bold">?</text>
      </svg>
    )
  }

  const { shape = "circle", fill = "none", rotation_deg = 0, count = 1 } = cell
  const sizeScale = cell.size === "small" ? 0.55 : cell.size === "large" ? 1.0 : 0.75
  const patternId = `stripes-${Math.random().toString(36).slice(2, 8)}`

  const strokeColor = "#e2e8f0"

  // For count > 1, arrange shapes in a row
  const positions: [number, number][] = []
  if (count === 1) {
    positions.push([30, 30])
  } else if (count === 2) {
    positions.push([18, 30], [42, 30])
  } else if (count === 3) {
    positions.push([12, 30], [30, 30], [48, 30])
  } else {
    // 4+: 2x2 grid
    positions.push([18, 18], [42, 18], [18, 42], [42, 42])
  }

  // Scale down shapes when count > 1
  const countScale = count === 1 ? sizeScale : count === 2 ? sizeScale * 0.65 : sizeScale * 0.5

  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {fill === "striped" && (
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
            <line x1="0" y1="0" x2="6" y2="6" stroke={strokeColor} strokeWidth="1.5" />
          </pattern>
        </defs>
      )}
      {positions.slice(0, count).map(([cx, cy], i) => (
        <g key={i}>
          {renderShape(shape, fill, rotation_deg, cx, cy, countScale, patternId)}
        </g>
      ))}
    </svg>
  )
}
