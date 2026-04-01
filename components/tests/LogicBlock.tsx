"use client"

import { useCallback, useRef, useState } from "react"
import { loadTestBlock, computeBlockResult, type AnswerLogEntry } from "@/lib/test-engine"
import { QuestionCard } from "./QuestionCard"
import { ShapeRenderer } from "./ShapeRenderer"
import { cn } from "@/lib/utils"

interface Props {
  onComplete: (result: ReturnType<typeof computeBlockResult>) => void
}

export function LogicBlock({ onComplete }: Props) {
  const tasks = useRef(loadTestBlock("logic")).current
  const [taskIdx, setTaskIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerLogEntry[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const startTime = useRef(Date.now())

  const task = tasks[taskIdx]

  const handleSelect = useCallback(
    (optIdx: number) => {
      if (selected !== null) return
      setSelected(optIdx)

      const entry: AnswerLogEntry = {
        taskIndex: taskIdx,
        taskId: task.id,
        taskType: task.type,
        wasCorrect: optIdx === task.correctOption,
        responseTimeMs: Date.now() - startTime.current,
        selectedOption: optIdx,
        correctOption: task.correctOption,
      }

      const newAnswers = [...answers, entry]

      setTimeout(() => {
        if (taskIdx + 1 < tasks.length) {
          setTaskIdx(taskIdx + 1)
          setSelected(null)
          startTime.current = Date.now()
          setAnswers(newAnswers)
        } else {
          onComplete(computeBlockResult(newAnswers))
        }
      }, 600)
    },
    [taskIdx, task, answers, selected, tasks, onComplete]
  )

  if (!task) return null

  return (
    <QuestionCard current={taskIdx + 1} total={tasks.length} title={task.type}>
      {/* Number series */}
      {task.type === "number-series" && (
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 text-4xl font-bold">
            {task.prompt.sequence.map((n: number, i: number) => (
              <span key={i}>{n}</span>
            ))}
            <span className="text-accent">?</span>
          </div>
          <div className="grid w-full max-w-lg grid-cols-2 gap-3">
            {task.options.map((opt: number, i: number) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={cn(
                  "min-h-btn rounded-xl px-6 py-4 text-xl font-bold transition-colors",
                  selected === i
                    ? i === task.correctOption
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    : "bg-surface-card text-white hover:bg-surface-light"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Figure sequence */}
      {task.type === "figure-sequence" && (
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            {task.prompt.figures.map((fig: { shape: string; color: string; size?: number; rotation?: number }, i: number) => (
              <ShapeRenderer key={i} shape={fig.shape} color={fig.color} size={fig.size || 1.5} rotation={fig.rotation || 0} />
            ))}
            <span className="text-4xl font-bold text-accent">?</span>
          </div>
          <div className="grid w-full max-w-lg grid-cols-2 gap-3">
            {task.options.map((opt: { shape: string; color: string; size?: number; rotation?: number }, i: number) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={cn(
                  "flex min-h-btn items-center justify-center rounded-xl p-4 transition-colors",
                  selected === i
                    ? i === task.correctOption
                      ? "bg-green-600"
                      : "bg-red-600"
                    : "bg-surface-card hover:bg-surface-light"
                )}
              >
                <ShapeRenderer shape={opt.shape} color={opt.color} size={opt.size || 1.5} rotation={opt.rotation || 0} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mini matrix */}
      {task.type === "mini-matrix" && (
        <div className="flex flex-col items-center gap-8">
          <div className="grid grid-cols-2 gap-2">
            {task.prompt.grid.flat().map((cell: { shape: string; color: string } | null, i: number) =>
              cell ? (
                <div key={i} className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-card">
                  <ShapeRenderer shape={cell.shape} color={cell.color} size={1.5} />
                </div>
              ) : (
                <div key={i} className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-accent">
                  <span className="text-2xl text-accent">?</span>
                </div>
              )
            )}
          </div>
          <div className="grid w-full max-w-lg grid-cols-2 gap-3">
            {task.options.map((opt: { shape: string; color: string }, i: number) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={cn(
                  "flex min-h-btn items-center justify-center rounded-xl p-4 transition-colors",
                  selected === i
                    ? i === task.correctOption
                      ? "bg-green-600"
                      : "bg-red-600"
                    : "bg-surface-card hover:bg-surface-light"
                )}
              >
                <ShapeRenderer shape={opt.shape} color={opt.color} size={1.5} />
              </button>
            ))}
          </div>
        </div>
      )}
    </QuestionCard>
  )
}
