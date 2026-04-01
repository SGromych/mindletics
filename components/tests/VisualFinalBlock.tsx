"use client"

import { useCallback, useRef, useState } from "react"
import { loadTestBlock, computeBlockResult, type AnswerLogEntry } from "@/lib/test-engine"
import { QuestionCard } from "./QuestionCard"
import { ShapeRenderer } from "./ShapeRenderer"
import { cn } from "@/lib/utils"

interface Props {
  onComplete: (result: ReturnType<typeof computeBlockResult>) => void
}

export function VisualFinalBlock({ onComplete }: Props) {
  const tasks = useRef(loadTestBlock("visual_final")).current
  const [taskIdx, setTaskIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerLogEntry[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const startTime = useRef(Date.now())

  const task = tasks[taskIdx]

  const advance = useCallback(
    (entry: AnswerLogEntry) => {
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
    [taskIdx, tasks, answers, onComplete]
  )

  if (!task) return null

  // TARGET SEARCH
  if (task.type === "target-search") {
    const target = task.prompt.target

    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Найди совпадение">
        <div className="flex flex-col items-center gap-8">
          <div>
            <p className="mb-2 text-center text-gray-400">Найдите точное совпадение:</p>
            <div className="flex justify-center rounded-xl bg-surface-card p-4">
              <ShapeRenderer shape={target.shape} color={target.color} size={target.size || 2} rotation={target.rotation || 0} />
            </div>
          </div>
          <div className="grid w-full max-w-lg grid-cols-2 gap-3">
            {task.options.map((opt: { shape: string; color: string; size?: number; rotation?: number }, i: number) => (
              <button
                key={i}
                onClick={() => {
                  if (selected !== null) return
                  setSelected(i)
                  advance({
                    taskIndex: taskIdx,
                    taskId: task.id,
                    taskType: task.type,
                    wasCorrect: i === task.correctOption,
                    responseTimeMs: Date.now() - startTime.current,
                    selectedOption: i,
                    correctOption: task.correctOption,
                  })
                }}
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
                <ShapeRenderer shape={opt.shape} color={opt.color} size={opt.size || 2} rotation={opt.rotation || 0} />
              </button>
            ))}
          </div>
        </div>
      </QuestionCard>
    )
  }

  // PAIR COMPARE
  if (task.type === "pair-compare") {
    const { left, right, areSame } = task.prompt
    const COLORS: Record<string, string> = {
      circle: "#FF4444", square: "#4444FF", triangle: "#44AA44",
      star: "#FFAA00", diamond: "#AA44FF", heart: "#FF66AA", moon: "#8888CC",
    }

    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Одинаковые?">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-8">
            <div className="flex gap-2 rounded-xl bg-surface-card p-4">
              {left.map((s: string, i: number) => (
                <ShapeRenderer key={i} shape={s} color={COLORS[s] || "#FFFFFF"} size={1.5} />
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-500">vs</span>
            <div className="flex gap-2 rounded-xl bg-surface-card p-4">
              {right.map((s: string, i: number) => (
                <ShapeRenderer key={i} shape={s} color={COLORS[s] || "#FFFFFF"} size={1.5} />
              ))}
            </div>
          </div>
          <div className="flex w-full max-w-md gap-4">
            {[true, false].map((answer) => (
              <button
                key={String(answer)}
                onClick={() => {
                  if (selected !== null) return
                  const idx = answer ? 0 : 1
                  setSelected(idx)
                  advance({
                    taskIndex: taskIdx,
                    taskId: task.id,
                    taskType: task.type,
                    wasCorrect: answer === areSame,
                    responseTimeMs: Date.now() - startTime.current,
                    selectedOption: answer ? "same" : "different",
                    correctOption: areSame ? "same" : "different",
                  })
                }}
                disabled={selected !== null}
                className={cn(
                  "min-h-btn flex-1 rounded-xl px-6 py-4 text-xl font-bold transition-colors",
                  selected === (answer ? 0 : 1)
                    ? (answer === areSame ? "bg-green-600" : "bg-red-600") + " text-white"
                    : "bg-surface-card text-white hover:bg-surface-light"
                )}
              >
                {answer ? "ДА" : "НЕТ"}
              </button>
            ))}
          </div>
        </div>
      </QuestionCard>
    )
  }

  // VISUAL ANALOGY
  if (task.type === "visual-analogy") {
    const { pairA, pairB, pairC } = task.prompt

    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Визуальная аналогия">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 text-xl">
            <div className="rounded-lg bg-surface-card p-3">
              <ShapeRenderer shape={pairA.shape} color={pairA.color} size={1.8} />
            </div>
            <span className="text-gray-500">:</span>
            <div className="rounded-lg bg-surface-card p-3">
              <ShapeRenderer shape={pairB.shape} color={pairB.color} size={1.8} />
            </div>
            <span className="text-gray-500">=</span>
            <div className="rounded-lg bg-surface-card p-3">
              <ShapeRenderer shape={pairC.shape} color={pairC.color} size={1.8} />
            </div>
            <span className="text-gray-500">:</span>
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-accent">
              <span className="text-2xl text-accent">?</span>
            </div>
          </div>
          <div className="grid w-full max-w-lg grid-cols-2 gap-3">
            {task.options.map((opt: { shape: string; color: string }, i: number) => (
              <button
                key={i}
                onClick={() => {
                  if (selected !== null) return
                  setSelected(i)
                  advance({
                    taskIndex: taskIdx,
                    taskId: task.id,
                    taskType: task.type,
                    wasCorrect: i === task.correctOption,
                    responseTimeMs: Date.now() - startTime.current,
                    selectedOption: i,
                    correctOption: task.correctOption,
                  })
                }}
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
                <ShapeRenderer shape={opt.shape} color={opt.color} size={1.8} />
              </button>
            ))}
          </div>
        </div>
      </QuestionCard>
    )
  }

  return null
}
