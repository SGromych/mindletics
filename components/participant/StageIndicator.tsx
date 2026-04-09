"use client"

import { cn } from "@/lib/utils"
import type { Stage } from "@/lib/stages"

interface StageIndicatorProps {
  stages: Stage[]
  currentStageNo: number
  status: string
}

export function StageIndicator({ stages, currentStageNo, status }: StageIndicatorProps) {
  return (
    <div className="flex w-full gap-1.5">
      {stages.map((stage) => {
        const isDone = stage.stageNo < currentStageNo || status === "finished"
        const isCurrent = stage.stageNo === currentStageNo && status === "in_progress"
        const isCognitive = stage.type === "cognitive"

        return (
          <div key={stage.stageNo} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "h-3 w-full rounded-full transition-colors",
                isDone && "bg-accent",
                isCurrent && "bg-accent/50 animate-pulse",
                !isDone && !isCurrent && "bg-white/10"
              )}
            />
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wide",
              isCurrent ? "text-accent" : "text-gray-500"
            )}>
              {isCognitive ? "Mind" : "Body"}
            </span>
          </div>
        )
      })}
    </div>
  )
}
