"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Timer } from "@/components/ui/Timer"
import { Modal } from "@/components/ui/Modal"
import { StageIndicator } from "./StageIndicator"
import { getStage, isCognitiveStage, isLastStage } from "@/lib/stages"
import { LogicBlock } from "@/components/tests/LogicBlock"
import { MemoryBlock } from "@/components/tests/MemoryBlock"
import { ReactionBlock } from "@/components/tests/ReactionBlock"
import { VisualFinalBlock } from "@/components/tests/VisualFinalBlock"

interface AttemptData {
  id: string
  status: string
  currentStageNo: number
  startedAt: string | null
  finishedAt: string | null
  totalTimeSec: number
  totalCorrect: number
  totalWrong: number
  participant: { displayName: string; bibNumber: string; gender: string; age: number }
  event: { eventName: string; hallName: string; eventDate: string }
  stageResults: Array<{
    stageNo: number
    stageType: string
    correctAnswers: number
    wrongAnswers: number
  }>
}

interface BlockResult {
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  rawAnswersJson: unknown
}

export function AttemptScreen({ attemptId }: { attemptId: string }) {
  const [attempt, setAttempt] = useState<AttemptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLock, setActionLock] = useState(false)
  const [showAbortModal, setShowAbortModal] = useState(false)
  const [inCognitiveTest, setInCognitiveTest] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttempt = useCallback(async () => {
    const res = await fetch(`/api/attempts/${attemptId}`)
    if (res.ok) {
      const data = await res.json()
      setAttempt(data)
    }
    setLoading(false)
  }, [attemptId])

  useEffect(() => {
    fetchAttempt()
  }, [fetchAttempt])

  async function handleStart() {
    setActionLock(true)
    const res = await fetch("/api/attempts/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    })
    if (res.ok) setAttempt(await res.json())
    setTimeout(() => setActionLock(false), 2000)
  }

  const lastStageResultRef = { current: null as BlockResult | undefined | null }

  async function handleNextLevel(stageResult?: BlockResult) {
    if (stageResult !== undefined) lastStageResultRef.current = stageResult
    setActionLock(true)
    setInCognitiveTest(false)
    setError(null)
    try {
      const res = await fetch("/api/attempts/next-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, stageResult: stageResult ?? lastStageResultRef.current }),
      })
      if (res.ok) {
        setAttempt(await res.json())
        lastStageResultRef.current = null
      } else {
        const msg = await res.text().catch(() => "")
        setError(msg || "Ошибка сервера. Попробуйте ещё раз.")
        setActionLock(false)
        return
      }
    } catch {
      setError("Нет связи с сервером. Проверьте подключение.")
      setActionLock(false)
      return
    }
    setTimeout(() => setActionLock(false), 2000)
  }

  async function handleAbort() {
    setShowAbortModal(false)
    setActionLock(true)
    const res = await fetch("/api/attempts/abort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    })
    if (res.ok) setAttempt(await res.json())
    setActionLock(false)
  }

  if (loading || !attempt) {
    return <div className="flex min-h-screen items-center justify-center text-xl">Загрузка...</div>
  }

  const stage = getStage(attempt.currentStageNo)
  const isCognitive = stage && isCognitiveStage(attempt.currentStageNo)
  const isLast = isLastStage(attempt.currentStageNo)

  // REGISTERED — show start screen
  if (attempt.status === "registered") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-gray-400">#{attempt.participant.bibNumber}</p>
          <h1 className="text-4xl font-black">{attempt.participant.displayName}</h1>
          <p className="mt-1 text-gray-400">
            {attempt.participant.gender === "male" ? "М" : "Ж"} / {attempt.participant.age} лет
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{attempt.event.eventName}</h2>
          <p className="text-gray-400">{attempt.event.hallName}</p>
        </div>
        <Button onClick={handleStart} disabled={actionLock} className="px-16 py-6 text-2xl">
          START
        </Button>
      </div>
    )
  }

  // FINISHED
  if (attempt.status === "finished") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-4xl font-black text-accent">ФИНИШ!</h1>
        <p className="text-xl">{attempt.participant.displayName}</p>
        <Timer startedAt={attempt.startedAt} stoppedAt={attempt.finishedAt} />
        <div className="flex gap-8 text-xl">
          <div>
            <span className="text-accent font-bold">{attempt.totalCorrect}</span> правильно
          </div>
          <div>
            <span className="text-red-400 font-bold">{attempt.totalWrong}</span> ошибок
          </div>
        </div>
        <StageIndicator currentStageNo={attempt.currentStageNo} status={attempt.status} />
        <Link
          href="/"
          className="mt-4 inline-flex min-h-btn items-center justify-center rounded-xl bg-surface-card px-10 py-4 text-lg font-bold transition hover:bg-surface-light"
        >
          На главную
        </Link>
      </div>
    )
  }

  // ABORTED
  if (attempt.status === "aborted") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-4xl font-black text-red-400">ПРЕРВАНО</h1>
        <p className="text-xl">{attempt.participant.displayName}</p>
        <Timer startedAt={attempt.startedAt} stoppedAt={attempt.finishedAt} />
        <StageIndicator currentStageNo={attempt.currentStageNo} status={attempt.status} />
        <Link
          href="/"
          className="mt-4 inline-flex min-h-btn items-center justify-center rounded-xl bg-surface-card px-10 py-4 text-lg font-bold transition hover:bg-surface-light"
        >
          На главную
        </Link>
      </div>
    )
  }

  // IN PROGRESS — cognitive test active
  if (isCognitive && (inCognitiveTest || true)) {
    const testType = stage!.testType!
    const blockProps = {
      onComplete: (result: BlockResult) => handleNextLevel(result),
    }

    return (
      <div className="flex min-h-screen flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400">Этап {attempt.currentStageNo}/8</span>
            <h2 className="text-xl font-bold">{stage!.title}</h2>
          </div>
          <Timer startedAt={attempt.startedAt} stoppedAt={null} />
        </div>
        <StageIndicator currentStageNo={attempt.currentStageNo} status={attempt.status} />

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/20 border border-red-500/40 p-4 text-center">
            <p className="text-red-300 font-semibold mb-3">{error}</p>
            <Button onClick={() => handleNextLevel()} disabled={actionLock} className="px-10 py-4 text-lg">
              {isLast ? "ЗАВЕРШИТЬ" : "ПОВТОРИТЬ"}
            </Button>
          </div>
        )}

        {!error && (
          <div className="mt-4 flex-1">
            {testType === "logic" && <LogicBlock {...blockProps} />}
            {testType === "memory" && <MemoryBlock {...blockProps} />}
            {testType === "reaction" && <ReactionBlock {...blockProps} />}
            {testType === "visual_final" && <VisualFinalBlock {...blockProps} />}
          </div>
        )}
        <div className="mt-4">
          <Button variant="danger" onClick={() => setShowAbortModal(true)} disabled={actionLock}>
            ПРЕРВАТЬ
          </Button>
        </div>
        <Modal
          open={showAbortModal}
          title="Прервать попытку?"
          message="Вы уверены? Это действие нельзя отменить."
          confirmText="Прервать"
          onConfirm={handleAbort}
          onCancel={() => setShowAbortModal(false)}
        />
      </div>
    )
  }

  // IN PROGRESS — physical stage
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">#{attempt.participant.bibNumber}</span>
        <span className="text-lg font-bold">{attempt.participant.displayName}</span>
      </div>

      <Timer startedAt={attempt.startedAt} stoppedAt={null} />

      <StageIndicator currentStageNo={attempt.currentStageNo} status={attempt.status} />

      <div className="my-4">
        <p className="text-sm font-semibold text-accent">ЭТАП {attempt.currentStageNo} / 8</p>
        <h2 className="mt-2 text-3xl font-black">{stage?.title}</h2>
        <p className="mt-2 text-gray-400">
          {stage?.type === "physical" ? "Выполните упражнение и нажмите ДАЛЕЕ" : ""}
        </p>
      </div>

      {error && (
        <div className="w-full max-w-md rounded-xl bg-red-500/20 border border-red-500/40 p-4 text-center">
          <p className="text-red-300 font-semibold mb-3">{error}</p>
        </div>
      )}

      <div className="flex w-full max-w-md flex-col gap-4">
        <Button onClick={() => handleNextLevel()} disabled={actionLock} className="py-6 text-2xl">
          {isLast ? "ФИНИШ" : "ДАЛЕЕ"}
        </Button>
        <Button variant="danger" onClick={() => setShowAbortModal(true)} disabled={actionLock}>
          ПРЕРВАТЬ
        </Button>
      </div>

      <Modal
        open={showAbortModal}
        title="Abort Attempt?"
        message="Are you sure you want to abort? This cannot be undone."
        confirmText="Abort"
        onConfirm={handleAbort}
        onCancel={() => setShowAbortModal(false)}
      />
    </div>
  )
}
