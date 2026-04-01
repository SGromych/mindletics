"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { loadTestBlock, computeBlockResult, type AnswerLogEntry } from "@/lib/test-engine"
import { QuestionCard } from "./QuestionCard"
import { MemoryGrid } from "./MemoryGrid"
import { ShapeRenderer } from "./ShapeRenderer"
import { cn } from "@/lib/utils"

const SHAPE_COLORS: Record<string, string> = {
  circle: "#FF4444",
  square: "#4444FF",
  triangle: "#44AA44",
  star: "#FFAA00",
  diamond: "#AA44FF",
  heart: "#FF66AA",
  moon: "#8888CC",
  sun: "#FFCC00",
  bolt: "#FFAA00",
  cloud: "#88BBDD",
  leaf: "#44CC44",
  flame: "#FF6600",
  drop: "#4488FF",
}

interface Props {
  onComplete: (result: ReturnType<typeof computeBlockResult>) => void
}

export function MemoryBlock({ onComplete }: Props) {
  const tasks = useRef(loadTestBlock("memory")).current
  const [taskIdx, setTaskIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerLogEntry[]>([])
  const [phase, setPhase] = useState<"show" | "recall">("show")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedCells, setSelectedCells] = useState<number[][]>([])
  const [selectedSequence, setSelectedSequence] = useState<string[]>([])
  const [seqShowIdx, setSeqShowIdx] = useState(0)
  const startTime = useRef(Date.now())

  const task = tasks[taskIdx]

  // Auto-transition from show to recall after duration
  useEffect(() => {
    if (!task) return
    setPhase("show")
    setSelectedItems([])
    setSelectedCells([])
    setSelectedSequence([])
    setSeqShowIdx(0)
    startTime.current = Date.now()

    if (task.type === "memorise-sequence") {
      // Show shapes one by one
      const interval = task.prompt.showIntervalMs || 1000
      const seq = task.prompt.sequence as string[]
      let idx = 0
      const timer = setInterval(() => {
        idx++
        setSeqShowIdx(idx)
        if (idx >= seq.length) {
          clearInterval(timer)
          setTimeout(() => {
            setPhase("recall")
            startTime.current = Date.now()
          }, interval)
        }
      }, interval)
      return () => clearInterval(timer)
    }

    const duration = task.prompt.showDurationMs || 3000
    const timer = setTimeout(() => {
      setPhase("recall")
      startTime.current = Date.now()
    }, duration)
    return () => clearTimeout(timer)
  }, [taskIdx, task])

  const advance = useCallback(
    (entry: AnswerLogEntry) => {
      const newAnswers = [...answers, entry]
      setTimeout(() => {
        if (taskIdx + 1 < tasks.length) {
          setTaskIdx(taskIdx + 1)
          setAnswers(newAnswers)
        } else {
          onComplete(computeBlockResult(newAnswers))
        }
      }, 800)
    },
    [taskIdx, tasks, answers, onComplete]
  )

  if (!task) return null

  // MEMORISE-OBJECTS
  if (task.type === "memorise-objects") {
    const showItems = task.prompt.showItems as string[]
    const selectable = task.selectable as string[]

    const handleSubmitObjects = () => {
      const correct = showItems.filter((item: string) => selectedItems.includes(item))
      const entry: AnswerLogEntry = {
        taskIndex: taskIdx,
        taskId: task.id,
        taskType: task.type,
        wasCorrect: correct.length === showItems.length && selectedItems.length === showItems.length,
        responseTimeMs: Date.now() - startTime.current,
        selectedOption: selectedItems,
        correctOption: showItems,
      }
      advance(entry)
    }

    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Запомни объекты">
        {phase === "show" ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-gray-400">Запомните эти объекты!</p>
            <div className="flex flex-wrap justify-center gap-4">
              {showItems.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-xl bg-surface-card p-4">
                  <ShapeRenderer shape={item} color={SHAPE_COLORS[item] || "#FFFFFF"} size={2} />
                  <span className="text-xs text-gray-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-gray-400">Выберите объекты, которые видели</p>
            <div className="flex flex-wrap justify-center gap-3">
              {selectable.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedItems((prev) =>
                      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                    )
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl p-4 transition-colors",
                    selectedItems.includes(item) ? "bg-accent/30 ring-2 ring-accent" : "bg-surface-card"
                  )}
                >
                  <ShapeRenderer shape={item} color={SHAPE_COLORS[item] || "#FFFFFF"} size={1.5} />
                  <span className="text-xs text-gray-400">{item}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmitObjects}
              className="min-h-btn w-full max-w-xs rounded-xl bg-accent px-6 py-4 text-lg font-bold text-black"
            >
              CONFIRM
            </button>
          </div>
        )}
      </QuestionCard>
    )
  }

  // MEMORISE-GRID
  if (task.type === "memorise-grid") {
    const { gridSize, highlightedCells } = task.prompt

    const handleSubmitGrid = () => {
      const correctKeys = highlightedCells.map(([r, c]: number[]) => `${r},${c}`)
      const selectedKeys = selectedCells.map(([r, c]) => `${r},${c}`)
      const allMatch = correctKeys.length === selectedKeys.length && correctKeys.every((v: string) => selectedKeys.includes(v))

      const entry: AnswerLogEntry = {
        taskIndex: taskIdx,
        taskId: task.id,
        taskType: task.type,
        wasCorrect: allMatch,
        responseTimeMs: Date.now() - startTime.current,
        selectedOption: selectedCells,
        correctOption: highlightedCells,
      }
      advance(entry)
    }

    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Запомни сетку">
        <div className="flex flex-col items-center gap-4">
          {phase === "show" && <p className="text-lg text-gray-400">Запомните выделенные клетки!</p>}
          {phase === "recall" && <p className="text-lg text-gray-400">Нажмите на клетки, которые запомнили</p>}
          <MemoryGrid
            gridSize={gridSize}
            highlighted={highlightedCells}
            showHighlight={phase === "show"}
            selectedCells={selectedCells}
            onCellClick={(r, c) => {
              if (phase === "show") return
              setSelectedCells((prev) => {
                const exists = prev.some(([sr, sc]) => sr === r && sc === c)
                return exists ? prev.filter(([sr, sc]) => !(sr === r && sc === c)) : [...prev, [r, c]]
              })
            }}
          />
          {phase === "recall" && (
            <button
              onClick={handleSubmitGrid}
              className="min-h-btn w-full max-w-xs rounded-xl bg-accent px-6 py-4 text-lg font-bold text-black"
            >
              CONFIRM
            </button>
          )}
        </div>
      </QuestionCard>
    )
  }

  // MEMORISE-SEQUENCE
  if (task.type === "memorise-sequence") {
    const seq = task.prompt.sequence as string[]
    const allShapes = task.allShapes as string[]

    const handleSubmitSequence = () => {
      const isCorrect = seq.length === selectedSequence.length && seq.every((s, i) => s === selectedSequence[i])
      const entry: AnswerLogEntry = {
        taskIndex: taskIdx,
        taskId: task.id,
        taskType: task.type,
        wasCorrect: isCorrect,
        responseTimeMs: Date.now() - startTime.current,
        selectedOption: selectedSequence,
        correctOption: seq,
      }
      advance(entry)
    }

    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Запомни последовательность">
        <div className="flex flex-col items-center gap-4">
          {phase === "show" ? (
            <>
              <p className="text-lg text-gray-400">Следите за последовательностью!</p>
              <div className="flex h-24 items-center justify-center">
                {seqShowIdx < seq.length && (
                  <ShapeRenderer
                    shape={seq[seqShowIdx]}
                    color={SHAPE_COLORS[seq[seqShowIdx]] || "#FFFFFF"}
                    size={3}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-400">
                Нажмите фигуры по порядку ({selectedSequence.length}/{seq.length})
              </p>
              <div className="mb-2 flex gap-2">
                {selectedSequence.map((s, i) => (
                  <ShapeRenderer key={i} shape={s} color={SHAPE_COLORS[s] || "#FFFFFF"} size={1.2} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {allShapes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (selectedSequence.length < seq.length) {
                        setSelectedSequence((prev) => [...prev, s])
                      }
                    }}
                    className="flex flex-col items-center gap-1 rounded-xl bg-surface-card p-4 hover:bg-surface-light"
                  >
                    <ShapeRenderer shape={s} color={SHAPE_COLORS[s] || "#FFFFFF"} size={1.5} />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSequence([])}
                  className="rounded-xl bg-surface-card px-6 py-3 font-bold hover:bg-surface-light"
                >
                  СБРОС
                </button>
                <button
                  onClick={handleSubmitSequence}
                  disabled={selectedSequence.length !== seq.length}
                  className="min-h-btn rounded-xl bg-accent px-8 py-3 text-lg font-bold text-black disabled:opacity-40"
                >
                  ПОДТВЕРДИТЬ
                </button>
              </div>
            </>
          )}
        </div>
      </QuestionCard>
    )
  }

  return null
}
