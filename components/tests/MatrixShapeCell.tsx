"use client"

interface CellData {
  shape?: string
  fill?: string
  rotation_deg?: number
  count?: number
  missing?: boolean
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

  const { shape = "circle", fill = "none", rotation_deg = 0 } = cell

  const fillColor = fill === "solid" ? "#e2e8f0" : "none"
  const strokeColor = "#e2e8f0"
  const patternId = `stripes-${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {fill === "striped" && (
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
            <line x1="0" y1="0" x2="6" y2="6" stroke="#e2e8f0" strokeWidth="1.5" />
          </pattern>
        </defs>
      )}
      <g transform={`rotate(${rotation_deg} 30 30)`}>
        {shape === "circle" && (
          <circle cx="30" cy="30" r="22" fill={fill === "striped" ? `url(#${patternId})` : fillColor} stroke={strokeColor} strokeWidth="2" />
        )}
        {shape === "square" && (
          <rect x="8" y="8" width="44" height="44" rx="3" fill={fill === "striped" ? `url(#${patternId})` : fillColor} stroke={strokeColor} strokeWidth="2" />
        )}
        {shape === "triangle" && (
          <polygon points="30,6 54,52 6,52" fill={fill === "striped" ? `url(#${patternId})` : fillColor} stroke={strokeColor} strokeWidth="2" />
        )}
      </g>
    </svg>
  )
}
