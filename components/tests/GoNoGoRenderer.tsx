"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (selected: string) => void
}

const SYMBOL_POOL = ["■", "●", "◆", "✚", "★", "△", "○", "□"]
const SYMBOL_INTERVAL_MS = 650
const TARGET_DURATION_MS = 1400
// Total round duration — shorter than the block's 20s question timer so
// the participant doesn't have to stare at distractors forever.
const ROUND_DURATION_MS = 10000
// Target shows up somewhere in this window (for is_target tasks only).
const TARGET_MIN_MS = 2000
const TARGET_MAX_MS = 7000

export function GoNoGoRenderer({ task, onAnswer }: Props) {
  const targetSymbol: string = task.render.target_symbol
  const isTarget: boolean = task.payload.is_target === true

  const distractors = useMemo(
    () => SYMBOL_POOL.filter((s) => s !== targetSymbol),
    [targetSymbol]
  )

  const [currentSymbol, setCurrentSymbol] = useState<string>(() => {
    return distractors[Math.floor(Math.random() * distractors.length)]
  })
  const [showingTarget, setShowingTarget] = useState(false)

  const answeredRef = useRef(false)
  const showingTargetRef = useRef(false)
  useEffect(() => {
    showingTargetRef.current = showingTarget
  }, [showingTarget])

  const finish = useCallback((answer: string) => {
    if (answeredRef.current) return
    answeredRef.current = true
    onAnswer(answer)
  }, [onAnswer])

  const handleTap = useCallback(() => {
    if (answeredRef.current) return
    // Tap during target → "tap" (correct for is_target).
    // Tap on a distractor → "wrong_tap" (wrong for both is_target and !is_target,
    // because for !is_target the correct answer is "no_tap", not a false alarm).
    finish(showingTargetRef.current ? "tap" : "wrong_tap")
  }, [finish])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Cycle distractor symbols
    const cycle = setInterval(() => {
      if (answeredRef.current) return
      if (showingTargetRef.current) return
      const next = distractors[Math.floor(Math.random() * distractors.length)]
      setCurrentSymbol(next)
    }, SYMBOL_INTERVAL_MS)

    // If this is a target task, schedule the target window
    if (isTarget) {
      const targetAt = TARGET_MIN_MS + Math.random() * (TARGET_MAX_MS - TARGET_MIN_MS)
      timers.push(
        setTimeout(() => {
          if (answeredRef.current) return
          setShowingTarget(true)
          setCurrentSymbol(targetSymbol)
        }, targetAt)
      )
      timers.push(
        setTimeout(() => {
          if (answeredRef.current) return
          setShowingTarget(false)
          // Resume distractors after target window ends
          const next = distractors[Math.floor(Math.random() * distractors.length)]
          setCurrentSymbol(next)
        }, targetAt + TARGET_DURATION_MS)
      )
    }

    // End of round — send no_tap
    timers.push(
      setTimeout(() => {
        finish("no_tap")
      }, ROUND_DURATION_MS)
    )

    return () => {
      clearInterval(cycle)
      timers.forEach(clearTimeout)
    }
  }, [isTarget, targetSymbol, distractors, finish])

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-lg text-gray-300">
        Нажмите только если появится <span className="text-2xl text-accent">{targetSymbol}</span>
      </p>

      <div
        className={`text-9xl select-none transition ${
          showingTarget ? "text-accent scale-110" : "text-gray-200"
        }`}
      >
        {currentSymbol}
      </div>

      <button
        onClick={handleTap}
        className="min-h-btn w-full max-w-md rounded-xl bg-accent px-10 py-8 text-3xl font-bold text-white transition hover:bg-accent/80 active:scale-95"
      >
        НАЖАТЬ!
      </button>
    </div>
  )
}
