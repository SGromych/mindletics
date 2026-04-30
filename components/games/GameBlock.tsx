"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  buildGameBlock,
  GAME_ANSWER_TIME_SEC,
  GAME_PREP_TIME_SEC,
  GAME_STATION_MAX_SEC,
  type GameMode,
} from "@/lib/game-engine"
import {
  checkAnswer,
  computeBlockResult,
  PENALTY_SEC,
  type AnswerLogEntry,
  type BlockResult,
} from "@/lib/test-engine"
import { formatTime } from "@/lib/utils"
import { ChessBoardRenderer } from "./ChessBoardRenderer"
import { SudokuGridRenderer } from "./SudokuGridRenderer"

interface Props {
  stationIndex: 0 | 1 | 2
  eventId?: string
  heatNumber?: number
  penaltySec?: number
  gameMode?: GameMode
  taskCount?: number
  onComplete: (result: BlockResult) => void
}

export function GameBlock({ stationIndex, eventId, heatNumber, penaltySec: penaltyProp, gameMode = "chess_sudoku", taskCount = 4, onComplete }: Props) {
  const penalty = penaltyProp ?? PENALTY_SEC

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks = useMemo(() => buildGameBlock(stationIndex, eventId, heatNumber, gameMode, taskCount), [stationIndex, eventId, heatNumber, gameMode, taskCount])
  const totalTasks = tasks.length

  const [currentTask, setCurrentTask] = useState(0)
  const [phase, setPhase] = useState<"prep" | "answer">("prep")
  const [answers, setAnswers] = useState<AnswerLogEntry[]>([])
  const [stationTimeLeft, setStationTimeLeft] = useState(GAME_STATION_MAX_SEC)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(GAME_ANSWER_TIME_SEC)
  const [penaltyTotal, setPenaltyTotal] = useState(0)
  const [countdown, setCountdown] = useState(GAME_PREP_TIME_SEC)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState<{ correct: number; total: number; penalty: number } | null>(null)
  const [flashPenalty, setFlashPenalty] = useState<number | null>(null)

  const taskStartRef = useRef(Date.now())
  const answeredRef = useRef(false)
  const completedRef = useRef(false)
  const resultRef = useRef<BlockResult | null>(null)

  const finishBlock = useCallback((finalAnswers: AnswerLogEntry[]) => {
    if (completedRef.current) return
    completedRef.current = true
    const result = computeBlockResult(finalAnswers, totalTasks, penalty)
    resultRef.current = result
    setSummaryData({ correct: result.correctAnswers, total: totalTasks, penalty: result.penaltySec })
    setShowSummary(true)
  }, [totalTasks, penalty])

  // Guard against calling onComplete more than once
  const calledOnCompleteRef = useRef(false)

  useEffect(() => {
    if (!showSummary || !resultRef.current) return
    if (calledOnCompleteRef.current) return
    calledOnCompleteRef.current = true
    const timer = setTimeout(() => {
      onComplete(resultRef.current!)
    }, 2000)
    return () => clearTimeout(timer)
  }, [showSummary, onComplete])

  // Station timer
  useEffect(() => {
    const id = setInterval(() => {
      setStationTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(id); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (stationTimeLeft <= 0) finishBlock(answers)
  }, [stationTimeLeft, answers, finishBlock])

  // Prep phase timer
  useEffect(() => {
    if (phase !== "prep") return
    setCountdown(GAME_PREP_TIME_SEC)
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setPhase("answer")
          setQuestionTimeLeft(GAME_ANSWER_TIME_SEC)
          taskStartRef.current = Date.now()
          answeredRef.current = false
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, currentTask])

  // Question timer
  useEffect(() => {
    if (phase !== "answer") return
    const id = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(id); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, currentTask])

  // Auto-skip on timeout
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
      responseTimeMs: GAME_ANSWER_TIME_SEC * 1000,
      selectedOption: null,
      correctOption: task.correct_answer,
    }

    setPenaltyTotal((p) => p + penalty)
    setFlashPenalty(penalty)
    setTimeout(() => setFlashPenalty(null), 1500)
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
    // For 6x6 sudoku, the renderer sends "correct" or "wrong" directly
    const wasCorrect = task.correct_answer === "grid_match"
      ? selected === "correct"
      : checkAnswer(task, selected)

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
      setPenaltyTotal((p) => p + penalty)
      setFlashPenalty(penalty)
      setTimeout(() => setFlashPenalty(null), 1500)
    }

    const newAnswers = [...answers, entry]
    setAnswers(newAnswers)
    advanceOrFinish(newAnswers)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask, answers, tasks, penalty])

  // Summary screen
  if (showSummary && summaryData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-xl font-bold">Результат станции</p>
        <p className="text-4xl font-black">
          {summaryData.correct} / {summaryData.total}
        </p>
        {summaryData.penalty > 0 ? (
          <p className="text-2xl font-bold text-red-400">Штраф: +{summaryData.penalty}с</p>
        ) : (
          <p className="text-2xl font-bold text-green-400">Без штрафа!</p>
        )}
      </div>
    )
  }

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
        <p className="text-2xl font-bold">{task.prompt_text}</p>
        <div className="text-6xl font-black text-accent animate-pulse">
          {countdown}
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
    <div className="relative flex flex-col gap-4">
      {flashPenalty !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <span className="text-5xl font-black text-red-500 animate-pulse drop-shadow-lg">
            +{flashPenalty}с
          </span>
        </div>
      )}
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
        {renderMode === "chess_board" && (
          <ChessBoardRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "sudoku_grid" && (
          <SudokuGridRenderer task={task} onAnswer={handleAnswer} />
        )}
        {renderMode === "sudoku_6x6_grid" && (
          <SudokuGridRenderer task={task} onAnswer={handleAnswer} mode6x6 />
        )}
      </div>
    </div>
  )
}
