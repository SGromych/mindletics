"use client"

interface QuestionCardProps {
  current: number
  total: number
  title: string
  children: React.ReactNode
}

export function QuestionCard({ current, total, title, children }: QuestionCardProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-400">
          {current} / {total}
        </span>
        <span className="text-sm font-semibold text-accent">{title}</span>
      </div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  )
}
