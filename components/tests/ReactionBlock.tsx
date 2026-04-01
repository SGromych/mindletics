"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { loadTestBlock, computeBlockResult, type AnswerLogEntry } from "@/lib/test-engine"
import { QuestionCard } from "./QuestionCard"
import { ColorButtons } from "./ColorButtons"
import { ShapeRenderer } from "./ShapeRenderer"
import { cn } from "@/lib/utils"

interface Props {
  onComplete: (result: ReturnType<typeof computeBlockResult>) => void
}

const GO_NOGO_TIMEOUT = 2000

export function ReactionBlock({ onComplete }: Props) {
  const tasks = useRef(loadTestBlock("reaction")).current
  const [taskIdx, setTaskIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerLogEntry[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [goNoGoPressed, setGoNoGoPressed] = useState<boolean | null>(null)
  const startTime = useRef(Date.now())

  const task = tasks[taskIdx]

  // Reset on new task
  useEffect(() => {
    setSelected(null)
    setGoNoGoPressed(null)
    startTime.current = Date.now()
  }, [taskIdx])

  // Go/No-Go timeout
  useEffect(() => {
    if (!task || task.type !== "go-no-go") return
    const timer = setTimeout(() => {
      if (goNoGoPressed !== null) return
      // User didn't press — correct if not target
      const isTarget = task.prompt.isTarget
      const entry: AnswerLogEntry = {
        taskIndex: taskIdx,
        taskId: task.id,
        taskType: task.type,
        wasCorrect: !isTarget,
        responseTimeMs: GO_NOGO_TIMEOUT,
        selectedOption: "no_press",
        correctOption: isTarget ? "press" : "no_press",
      }
      const newAnswers = [...answers, entry]
      if (taskIdx + 1 < tasks.length) {
        setTaskIdx(taskIdx + 1)
        setAnswers(newAnswers)
      } else {
        onComplete(computeBlockResult(newAnswers))
      }
    }, GO_NOGO_TIMEOUT)
    return () => clearTimeout(timer)
  }, [taskIdx, task, goNoGoPressed, answers, tasks, onComplete])

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
      }, 600)
    },
    [taskIdx, tasks, answers, onComplete]
  )

  if (!task) return null

  // CHOICE-REACTION
  if (task.type === "choice-reaction") {
    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Choice Reaction">
        <div className="flex flex-col items-center gap-8">
          <div
            className="h-32 w-32 rounded-2xl"
            style={{ backgroundColor: task.prompt.stimulusColor }}
          />
          <p className="text-gray-400">Нажмите на соответствующий цвет</p>
          <ColorButtons
            options={task.options}
            selected={selected}
            correctOption={task.correctOption}
            onSelect={(i) => {
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
          />
        </div>
      </QuestionCard>
    )
  }

  // GO / NO-GO
  if (task.type === "go-no-go") {
    const isTarget = task.prompt.isTarget
    const stimShape = task.prompt.stimulus

    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Go / No-Go">
        <div className="flex flex-col items-center gap-8">
          <p className="text-gray-400">
            Нажмите GO если видите <span className="font-bold text-accent">{task.targetShape}</span>. Иначе ждите.
          </p>
          <ShapeRenderer shape={stimShape} color="#FFFFFF" size={4} />
          <button
            onClick={() => {
              if (goNoGoPressed !== null) return
              setGoNoGoPressed(true)
              advance({
                taskIndex: taskIdx,
                taskId: task.id,
                taskType: task.type,
                wasCorrect: isTarget,
                responseTimeMs: Date.now() - startTime.current,
                selectedOption: "press",
                correctOption: isTarget ? "press" : "no_press",
              })
            }}
            disabled={goNoGoPressed !== null}
            className={cn(
              "min-h-btn w-full max-w-xs rounded-xl px-8 py-6 text-2xl font-black transition-colors",
              goNoGoPressed === null
                ? "bg-accent text-black"
                : goNoGoPressed && isTarget
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
            )}
          >
            GO!
          </button>
        </div>
      </QuestionCard>
    )
  }

  // STROOP
  if (task.type === "stroop") {
    return (
      <QuestionCard current={taskIdx + 1} total={tasks.length} title="Stroop">
        <div className="flex flex-col items-center gap-8">
          <p className="text-gray-400">Нажмите на <strong>цвет чернил</strong>, а не на слово</p>
          <span className="text-6xl font-black" style={{ color: task.prompt.inkColor }}>
            {task.prompt.word}
          </span>
          <ColorButtons
            options={task.options}
            selected={selected}
            correctOption={task.correctOption}
            onSelect={(i) => {
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
          />
        </div>
      </QuestionCard>
    )
  }

  return null
}
