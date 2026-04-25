"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Timer } from "@/components/ui/Timer"
import { Modal } from "@/components/ui/Modal"
import { StageIndicator } from "./StageIndicator"
import { buildStages, isCognitiveStage, isLastStage, stageToStationIndex, TOTAL_STAGES } from "@/lib/stages"
import { CognitiveBlock } from "@/components/tests/CognitiveBlock"
import { formatTime } from "@/lib/utils"
import type { Stage } from "@/lib/stages"
import type { BlockResult } from "@/lib/test-engine"

interface AttemptData {
  id: string
  eventId: string
  status: string
  currentStageNo: number
  startedAt: string | null
  finishedAt: string | null
  totalTimeSec: number
  totalCorrect: number
  totalWrong: number
  penaltyTimeSec: number
  participant: { firstName: string; lastName: string; bibNumber: string; gender: string; birthDate: string; heatNumber: number }
  event: { eventName: string; hallName: string; eventDate: string; exercises: string[]; penaltySec: number; heatCount: number }
  stageResults: Array<{
    stageNo: number
    stageType: string
    penaltySec: number
  }>
}

export function AttemptScreen({ attemptId }: { attemptId: string }) {
  const [attempt, setAttempt] = useState<AttemptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLock, setActionLock] = useState(false)
  const [showAbortModal, setShowAbortModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPenalty, setPendingPenalty] = useState(0)

  const lastStageResultRef = useRef<BlockResult | null>(null)

  // Penalty is derived from saved stage results plus any penalty from the
  // just-finished cognitive block that may not yet be reflected in attempt state.
  const savedPenalty = (attempt?.stageResults || []).reduce(
    (sum, sr) => sum + (sr.penaltySec || 0),
    0
  )
  const penaltyAccumulator = savedPenalty + pendingPenalty

  const fetchAttempt = useCallback(async () => {
    const res = await fetch(`/api/attempts/${attemptId}`)
    if (res.ok) {
      const data = await res.json()
      setAttempt(data)
      setPendingPenalty(0)
    }
    setLoading(false)
  }, [attemptId])

  useEffect(() => {
    fetchAttempt()
  }, [fetchAttempt])

  const stages: Stage[] = attempt ? buildStages(attempt.event.exercises) : []

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

  async function handleNextLevel(stageResult?: BlockResult) {
    if (stageResult !== undefined) lastStageResultRef.current = stageResult
    setActionLock(true)
    setError(null)
    try {
      const resultToSend = stageResult ?? lastStageResultRef.current
      const res = await fetch("/api/attempts/next-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, stageResult: resultToSend }),
      })
      if (res.ok) {
        const data = await res.json()
        setAttempt(data)
        setPendingPenalty(0)
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

  function handleCognitiveComplete(result: BlockResult) {
    // Immediately add penalty to the displayed timer so the subsequent
    // physical stage starts with the cognitive stage penalty already counted.
    setPendingPenalty((p) => p + result.penaltySec)
    handleNextLevel(result)
  }

  if (loading || !attempt) {
    return <div className="flex min-h-screen items-center justify-center text-xl">Загрузка...</div>
  }

  const currentStage = stages.find((s) => s.stageNo === attempt.currentStageNo)
  const isCognitive = currentStage && isCognitiveStage(attempt.currentStageNo)
  const isLast = isLastStage(attempt.currentStageNo)

  // REGISTERED
  if (attempt.status === "registered") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-gray-400">#{attempt.participant.bibNumber}</p>
          <h1 className="text-4xl font-black">{`${attempt.participant.lastName} ${attempt.participant.firstName}`}</h1>
          <p className="mt-1 text-gray-400">
            {attempt.participant.gender === "male" ? "М" : "Ж"} / {Math.floor((Date.now() - new Date(attempt.participant.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} лет
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
        <p className="text-xl">{`${attempt.participant.lastName} ${attempt.participant.firstName.charAt(0)}.`}</p>
        <div className="font-mono text-5xl font-black tracking-wider text-accent">
          {formatTime(attempt.totalTimeSec)}
        </div>
        {attempt.penaltyTimeSec > 0 && (
          <p className="text-sm text-red-400">
            (включая штраф +{attempt.penaltyTimeSec}с)
          </p>
        )}
        <StageIndicator stages={stages} currentStageNo={attempt.currentStageNo} status={attempt.status} />
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
        <p className="text-xl">{`${attempt.participant.lastName} ${attempt.participant.firstName.charAt(0)}.`}</p>
        <div className="font-mono text-5xl font-black tracking-wider text-accent">
          {formatTime(attempt.totalTimeSec)}
        </div>
        {attempt.penaltyTimeSec > 0 && (
          <p className="text-sm text-red-400">
            (включая штраф +{attempt.penaltyTimeSec}с)
          </p>
        )}
        <StageIndicator stages={stages} currentStageNo={attempt.currentStageNo} status={attempt.status} />
        <Link
          href="/"
          className="mt-4 inline-flex min-h-btn items-center justify-center rounded-xl bg-surface-card px-10 py-4 text-lg font-bold transition hover:bg-surface-light"
        >
          На главную
        </Link>
      </div>
    )
  }

  // IN PROGRESS — cognitive stage
  if (isCognitive) {
    const stationIdx = stageToStationIndex(attempt.currentStageNo)

    return (
      <div className="flex min-h-screen flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400">Этап {attempt.currentStageNo}/{TOTAL_STAGES}</span>
            <h2 className="text-xl font-bold">{currentStage!.title}</h2>
          </div>
          <Timer startedAt={attempt.startedAt} stoppedAt={null} penaltySec={penaltyAccumulator} />
        </div>
        <StageIndicator stages={stages} currentStageNo={attempt.currentStageNo} status={attempt.status} />

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/20 border border-red-500/40 p-4 text-center">
            <p className="text-red-300 font-semibold mb-3">{error}</p>
            <Button onClick={() => handleNextLevel()} disabled={actionLock} className="px-10 py-4 text-lg">
              ПОВТОРИТЬ
            </Button>
          </div>
        )}

        {!error && (
          <div className="mt-4 flex-1">
            <CognitiveBlock
              key={attempt.currentStageNo}
              stationIndex={stationIdx}
              eventId={attempt.eventId}
              heatNumber={attempt.participant.heatNumber}
              penaltySec={attempt.event.penaltySec}
              onComplete={handleCognitiveComplete}
            />
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
        <span className="text-lg font-bold">{`${attempt.participant.lastName} ${attempt.participant.firstName.charAt(0)}.`}</span>
      </div>

      <Timer startedAt={attempt.startedAt} stoppedAt={null} penaltySec={penaltyAccumulator} />

      <StageIndicator stages={stages} currentStageNo={attempt.currentStageNo} status={attempt.status} />

      <div className="my-4">
        <p className="text-sm font-semibold text-accent">ЭТАП {attempt.currentStageNo} / {TOTAL_STAGES}</p>
        <h2 className="mt-2 text-3xl font-black">{currentStage?.title}</h2>
        <p className="mt-2 text-gray-400">Выполните упражнение и нажмите ДАЛЕЕ</p>
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
        title="Прервать попытку?"
        message="Вы уверены? Это действие нельзя отменить."
        confirmText="Прервать"
        onConfirm={handleAbort}
        onCancel={() => setShowAbortModal(false)}
      />
    </div>
  )
}
