"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type Variant = "primary" | "secondary" | "danger"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-accent text-black hover:bg-accent-dark",
  secondary: "bg-surface-card text-white hover:bg-surface-light",
  danger: "bg-red-600 text-white hover:bg-red-700",
}

export function Button({ variant = "primary", fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "min-h-btn rounded-xl px-6 py-4 text-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        variantStyles[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
