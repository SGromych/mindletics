"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  buildCognitiveBlock,
  checkAnswer,
  computeBlockResult,
  ANSWER_TIME_SEC,
  PREP_TIME_SEC,
  STATION_MAX_SEC,
  PENALTY_SEC,
  type AnswerLogEntry,
  type BlockResult,
} from "@/lib/test-engine"
import { formatTime } from "@/lib/utils"
import { NumberSequenceRenderer } from "./NumberSequenceRenderer"
import { MatrixRuleRenderer } from "./MatrixRuleRenderer"
import { StroopRenderer } from "./StroopRenderer"
import { SpatialRenderer } from "./SpatialRenderer"
import { MemoryGridRenderer } from "./MemoryGridRenderer"
import { SymbolSequenceRenderer } from "./SymbolSequenceRenderer"
import { ObjectRecognitionRenderer } from "./ObjectRecognitionRenderer"
import { ReactionNumberRenderer } from "./ReactionNumberRenderer"
import { ChoiceReactionRenderer } from "./ChoiceReactionRenderer"
import { GoNoGoRenderer } from "./GoNoGoRenderer"

interface Props {
  stationIndex: 0 | 1 | 2
  onComplete: (result: BlockResult) => void
}

export function CognitiveBlock({ stationIndex, onComplete }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks = useMemo(() => buildCognitiveBlock(stationIndex), [stationIndex])
  const totalTasks = tasks.length

  const [currentTask, setCurrentTask] = useState(0)
  const [phase, setPhase] = useState<"prep" | "answer">("prep")
  const [answers, setAnswers] = useState<AnswerLogEntry[]>([])
  const [stationTimeLeft, setStationTimeLeft] = useState(STATION_MAX_SEC)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(ANSWER_TIME_SEC)
  const [penaltyTotal, setPenaltyTotal] = useState(0)

  const taskStartRef = useRef(Date.now())
  const answeredRef = useRef(false)
  const completedRef = useRef(false)

  const finishBlock = useCallback((finalAnswers: AnswerLogEntry[]) => {
    if (completedRef.current) return
    completedRef.current = true
    const result = computeBlockResult(finalAnswers, totalTasks)
    onComplete(result)
  }, [onComplete, totalTasks])

  // Station timer (3 min countdown)
  useEffect(() => {
    const id = setInterval(() => {
      setStationTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-finish when station timer runs out
  useEffect(() => {
    if (stationTimeLeft <= 0) {
      finishBlock(answers)
    }
  }, [stationTimeLeft, answers, finishBlock])

  // Prep phase timer
  useEffect(() => {
    if (phase !== "prep") return
    const timer = setTimeout(() => {
      setPhase("answer")
      setQuestionTimeLeft(ANSWER_TIME_SEC)
      taskStartRef.current = Date.now()
      answeredRef.current = false
    }, PREP_TIME_SEC * 1000)
    return () => clearTimeout(timer)
  }, [phase, currentTask])

  // Question timer countdown
  useEffect(() => {
    if (phase !== "answer") return
    const id = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, currentTask])

  // Auto-skip on question timeout
  useEffect(() => {
    if (phase !== "answer" || questionTimeLeft > 0) return
    if (answeredRef.current) return
    answeredRef.current = true

    const task = tasks[currentTask]
    const entry: AnswerLogEntry = {
      taskIndex: currentTask,
      taskId: task.id,
      taskType: task.subtype,
      wasCorrect: false,
      responseTimeMs: ANSWER_TIME_SEC * 1000,
      selectedOption: null,
      correctOption: task.correct_answer,
    }

    setPenaltyTotal((p) => p + PENALTY_SEC)
    const newAnswers = [...answers, entry]
    setAnswers(newAnswers)
    advanceOrFinish(newAnswers)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionTimeLeft, phase])

  function advanceOrFinish(currentAnswers: AnswerLogEntry[]) {
    if (currentTask + 1 >= totalTasks) {
      finishBlock(currentAnswers)
    } else {
      setCurrentTask((t) => t + 1)
      setPhase("prep")
    }
  }

  const handleAnswer = useCallback((selected: unknown) => {
    if (answeredRef.current || completedRef.current) return
    answeredRef.current = true

    const task = tasks[currentTask]
    const responseTimeMs = Date.now() - taskStartRef.current
    const wasCorrect = checkAnswer(task, selected)

    const entry: AnswerLogEntry = {
      taskIndex: currentTask,
      taskId: task.id,
      taskType: task.subtype,
      wasCorrect,
      responseTimeMs,
      selectedOption: selected,
      correctOption: task.correct_answer,
    }

    if (!wasCorrect) {
      setPenaltyTotal((p) => p + PENALTY_SEC)
    }

    const newAnswers = [...answers, entry]
    setAnswers(newAnswers)
    advanceOrFinish(newAnswers)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask, answers, tasks])

  if (completedRef.current || stationTimeLeft <= 0) {
    return (
      <div className="flex items-center justify-center py-12 text-xl text-gray-400">
        Обработка результатов...
      </div>
    )
  }

  const task = tasks[currentTask]

  if (phase === "prep") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-500">Станция: {formatTime(stationTimeLeft)}</span>
        </div>
        <p className="text-lg text-gray-400">Задание {currentTask + 1} / {totalTasks}</p>
        <p className="text-2xl font-bold">{task.prompt_title}</p>
        <div className="text-6xl font-black text-accent animate-pulse">
          {PREP_TIME_SEC}
        </div>
        <p className="text-gray-500">Приготовьтесь...</p>
        {penaltyTotal > 0 && (
          <p className="text-sm text-red-400">Штраф: +{penaltyTotal}с</p>
        )}
      </div>
    )
  }

  const renderMode = task.render?.mode

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {currentTask + 1} / {totalTasks} — {task.prompt_title}
        </span>
        <div className="flex items-center gap-4">
          {penaltyTotal > 0 && (
            <span className="text-red-400 font-mono">+{penaltyTotal}с</span>
          )}
          <span className={`font-mono font-bold ${questionTimeLeft <= 5 ? "text-red-400 animate-pulse" : "text-gray-300"}`}>
            {questionTimeLeft}с
          </span>
          <span className="text-gray-500 font-mono">{formatTime(stationTimeLeft)}</span>
        </div>
      </div>

      <div className="flex-1">
        {renderMode === "text_options" && (
          <NumberSequenceRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "svg_matrix_options" && (
          <MatrixRuleRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "color_word_buttons" && (
          <StroopRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "spatial_top_view" && (
          <SpatialRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "memory_grid" && (
          <MemoryGridRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "sequence_recall" && (
          <SymbolSequenceRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "multi_select_symbols" && (
          <ObjectRecognitionRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "animated_number_grid" && (
          <ReactionNumberRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "single_stimulus_buttons" && (
          <ChoiceReactionRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "go_no_go_single_button" && (
          <GoNoGoRenderer task={task} onAnswer={handleAnswer} />
        )}
      </div>
    </div>
  )
}
