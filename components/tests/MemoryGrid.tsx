"use client"

import { cn } from "@/lib/utils"

interface MemoryGridProps {
  gridSize: number
  highlighted: number[][] // [row, col]
  showHighlight: boolean
  selectedCells: number[][]
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
}

export function MemoryGrid({ gridSize, highlighted, showHighlight, selectedCells, onCellClick, disabled }: MemoryGridProps) {
  const isHighlighted = (r: number, c: number) => highlighted.some(([hr, hc]) => hr === r && hc === c)
  const isSelected = (r: number, c: number) => selectedCells.some(([sr, sc]) => sr === r && sc === c)

  return (
    <div
      className="mx-auto grid gap-2"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, maxWidth: gridSize * 80 }}
    >
      {Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => onCellClick?.(r, c)}
            disabled={disabled || showHighlight}
            className={cn(
              "aspect-square rounded-lg transition-colors",
              "min-h-[60px] min-w-[60px]",
              showHighlight && isHighlighted(r, c) && "bg-accent",
              !showHighlight && isSelected(r, c) && "bg-accent/70",
              !showHighlight && !isSelected(r, c) && "bg-surface-card hover:bg-surface-light",
              showHighlight && !isHighlighted(r, c) && "bg-surface-card"
            )}
          />
        ))
      )}
    </div>
  )
}
