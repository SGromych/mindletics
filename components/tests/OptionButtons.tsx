"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptionButtonsProps {
  options: string[]
  onSelect: (index: number) => void
  disabled?: boolean
}

export function OptionButtons({ options, onSelect, disabled }: OptionButtonsProps) {
  const [selected, setSelected] = useState<number | null>(null)

  function handleSelect(index: number) {
    if (disabled || selected !== null) return
    setSelected(index)
    onSelect(index)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          disabled={disabled || selected !== null}
          className={cn(
            "min-h-btn rounded-xl px-6 py-4 text-lg font-bold transition-colors",
            selected === i
              ? "bg-accent text-black"
              : "bg-surface-card text-white hover:bg-surface-light",
            "disabled:cursor-not-allowed"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
