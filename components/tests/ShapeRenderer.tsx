"use client"

interface ShapeProps {
  shape: string
  color: string
  size?: number
  rotation?: number
  className?: string
}

export function ShapeRenderer({ shape, color, size = 1, rotation = 0, className = "" }: ShapeProps) {
  const s = 40 * size
  const style = { transform: `rotate(${rotation}deg)` }

  return (
    <svg width={s} height={s} viewBox="0 0 40 40" className={className} style={style}>
      {shape === "circle" && <circle cx="20" cy="20" r="16" fill={color} />}
      {shape === "square" && <rect x="4" y="4" width="32" height="32" fill={color} />}
      {shape === "triangle" && <polygon points="20,4 36,36 4,36" fill={color} />}
      {shape === "star" && (
        <polygon
          points="20,2 25,15 38,15 27,24 31,37 20,29 9,37 13,24 2,15 15,15"
          fill={color}
        />
      )}
      {shape === "diamond" && <polygon points="20,2 38,20 20,38 2,20" fill={color} />}
      {shape === "heart" && (
        <path
          d="M20 35 C10 25 2 18 2 12 C2 6 8 2 14 2 C17 2 19 4 20 6 C21 4 23 2 26 2 C32 2 38 6 38 12 C38 18 30 25 20 35Z"
          fill={color}
        />
      )}
      {shape === "moon" && (
        <>
          <circle cx="20" cy="20" r="16" fill={color} />
          <circle cx="28" cy="16" r="12" fill="#1A1A2E" />
        </>
      )}
      {shape === "sun" && (
        <>
          <circle cx="20" cy="20" r="10" fill={color} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1="20"
              y1="20"
              x2={20 + 16 * Math.cos((a * Math.PI) / 180)}
              y2={20 + 16 * Math.sin((a * Math.PI) / 180)}
              stroke={color}
              strokeWidth="2"
            />
          ))}
        </>
      )}
      {shape === "bolt" && <polygon points="22,2 12,20 18,20 16,38 28,18 22,18" fill={color} />}
      {shape === "cloud" && (
        <path
          d="M10 28 C4 28 2 24 4 20 C2 16 6 12 12 12 C14 6 22 4 28 8 C34 8 38 14 36 20 C38 24 36 28 30 28 Z"
          fill={color}
        />
      )}
      {shape === "leaf" && (
        <path
          d="M20 4 C34 8 38 24 20 38 C2 24 6 8 20 4Z"
          fill={color}
        />
      )}
      {shape === "flame" && (
        <path
          d="M20 2 C24 10 34 16 30 28 C28 34 22 38 20 38 C18 38 12 34 10 28 C6 16 16 10 20 2Z"
          fill={color}
        />
      )}
      {shape === "drop" && (
        <path
          d="M20 4 C20 4 34 20 34 26 C34 34 28 38 20 38 C12 38 6 34 6 26 C6 20 20 4 20 4Z"
          fill={color}
        />
      )}
    </svg>
  )
}
