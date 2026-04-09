"use client"

interface Block {
  x: number
  y: number
  z: number
}

function isoProject(x: number, y: number, z: number, scale: number) {
  const px = (x - y) * scale * 0.866
  const py = (x + y) * scale * 0.5 - z * scale
  return { px, py }
}

function drawCube(x: number, y: number, z: number, scale: number) {
  const s = scale
  const top = [
    isoProject(x, y, z + 1, s),
    isoProject(x + 1, y, z + 1, s),
    isoProject(x + 1, y + 1, z + 1, s),
    isoProject(x, y + 1, z + 1, s),
  ]
  const left = [
    isoProject(x, y + 1, z + 1, s),
    isoProject(x + 1, y + 1, z + 1, s),
    isoProject(x + 1, y + 1, z, s),
    isoProject(x, y + 1, z, s),
  ]
  const right = [
    isoProject(x + 1, y, z + 1, s),
    isoProject(x + 1, y + 1, z + 1, s),
    isoProject(x + 1, y + 1, z, s),
    isoProject(x + 1, y, z, s),
  ]

  const toPoints = (pts: { px: number; py: number }[]) =>
    pts.map((p) => `${p.px},${p.py}`).join(" ")

  return { top: toPoints(top), left: toPoints(left), right: toPoints(right) }
}

export function IsometricRenderer({ blocks, size = 200 }: { blocks: number[][]; size?: number }) {
  const scale = size / 8

  // Painter's algorithm for isometric projection:
  // viewer looks at origin; back blocks have small (x+y), front have large.
  // Within the same depth diagonal, lower z draws first so upper cubes sit on top.
  const sorted = [...blocks].sort((a, b) => {
    const depthA = a[0] + a[1]
    const depthB = b[0] + b[1]
    if (depthA !== depthB) return depthA - depthB
    if (a[2] !== b[2]) return a[2] - b[2]
    if (a[1] !== b[1]) return a[1] - b[1]
    return a[0] - b[0]
  })

  const allPoints = blocks.flatMap((b) => {
    const corners = [
      isoProject(b[0], b[1], b[2], scale),
      isoProject(b[0] + 1, b[1] + 1, b[2] + 1, scale),
    ]
    return corners
  })

  const minX = Math.min(...allPoints.map((p) => p.px)) - 10
  const maxX = Math.max(...allPoints.map((p) => p.px)) + 10
  const minY = Math.min(...allPoints.map((p) => p.py)) - 10
  const maxY = Math.max(...allPoints.map((p) => p.py)) + 10
  const width = maxX - minX
  const height = maxY - minY

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${minX} ${minY} ${width} ${height}`}
      className="mx-auto"
    >
      {sorted.map((b, i) => {
        const cube = drawCube(b[0], b[1], b[2], scale)
        return (
          <g key={i}>
            <polygon points={cube.top} fill="#818cf8" stroke="#312e81" strokeWidth="1" />
            <polygon points={cube.left} fill="#6366f1" stroke="#312e81" strokeWidth="1" />
            <polygon points={cube.right} fill="#4f46e5" stroke="#312e81" strokeWidth="1" />
          </g>
        )
      })}
    </svg>
  )
}
