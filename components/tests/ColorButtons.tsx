"use client"

import { cn } from "@/lib/utils"

interface ColorOption {
  label: string
  color: string
}

interface ColorButtonsProps {
  options: ColorOption[]
  selected: number | null
  correctOption?: number
  onSelect: (index: number) => void
  disabled?: boolean
}

export function ColorButtons({ options, selected, correctOption, onSelect, disabled }: ColorButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          disabled={disabled || selected !== null}
          className={cn(
            "min-h-btn min-w-[100px] rounded-xl px-6 py-4 text-lg font-bold text-white transition-colors",
            selected === i
              ? i === correctOption
                ? "ring-4 ring-green-400"
                : "ring-4 ring-red-400"
              : "hover:brightness-110"
          )}
          style={{ backgroundColor: opt.color }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
