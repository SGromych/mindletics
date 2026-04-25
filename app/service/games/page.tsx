"use client"

import { useState, useCallback, useMemo } from "react"
import chessData from "@/data/games/chess.json"
import sudokuData from "@/data/games/sudoku.json"
import { checkAnswer } from "@/lib/test-engine"
import { ChessBoardRenderer } from "@/components/games/ChessBoardRenderer"
import { SudokuGridRenderer } from "@/components/games/SudokuGridRenderer"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestItem = any

interface AnswerState {
  selected: unknown
  isCorrect: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  chess: "Chess",
  sudoku: "Sudoku",
}

const CATEGORY_COLORS: Record<string, string> = {
  chess: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  sudoku: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODE_COMPONENTS: Record<string, React.ComponentType<{ task: any; onAnswer: (v: any) => void }>> = {
  chess_board: ChessBoardRenderer,
  sudoku_grid: SudokuGridRenderer,
}

function buildAllGames(): TestItem[] {
  return [
    ...(chessData as { items: TestItem[] }).items,
    ...(sudokuData as { items: TestItem[] }).items,
  ]
}

function groupByCategory(tests: TestItem[]): Record<string, TestItem[]> {
  const groups: Record<string, TestItem[]> = {}
  for (const t of tests) {
    const cat = t.category as string
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(t)
  }
  return groups
}

function formatCorrectAnswer(task: TestItem): string {
  const ans = task.correct_answer
  if (Array.isArray(ans)) return ans.join(", ")
  return String(ans)
}

export default function ServiceGamesPage() {
  const allTests = useMemo(() => buildAllGames(), [])
  const grouped = useMemo(() => groupByCategory(allTests), [allTests])
  const categories = useMemo(
    () => ["chess", "sudoku"].filter((c) => grouped[c]),
    [grouped]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState<AnswerState | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const currentTest = allTests[currentIndex]

  const handleAnswer = useCallback(
    (selected: unknown) => {
      const isCorrect = checkAnswer(currentTest, selected)
      setAnswer({ selected, isCorrect })
    },
    [currentTest]
  )

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
    setAnswer(null)
    setResetKey((k) => k + 1)
  }, [])

  const goNext = useCallback(() => {
    if (currentIndex < allTests.length - 1) goTo(currentIndex + 1)
  }, [currentIndex, allTests.length, goTo])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1)
  }, [currentIndex, goTo])

  const handleReset = useCallback(() => {
    setAnswer(null)
    setResetKey((k) => k + 1)
  }, [])

  const mode = currentTest?.render?.mode
  const Renderer = mode ? MODE_COMPONENTS[mode] : null

  let flatIndex = 0
  const indexMap = new Map<string, number>()
  for (const cat of categories) {
    for (const t of grouped[cat]) {
      indexMap.set(t.id, flatIndex++)
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1A1A2E", color: "#fff" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 280,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.1)",
          overflowY: "auto",
          background: "#12122A",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Game Catalog</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{allTests.length} puzzles</p>
        </div>

        {categories.map((cat) => (
          <div key={cat} style={{ marginBottom: 4 }}>
            <div
              style={{
                padding: "10px 20px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "#666",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {CATEGORY_LABELS[cat] || cat} ({grouped[cat].length})
            </div>
            {grouped[cat].map((t) => {
              const idx = indexMap.get(t.id)!
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={t.id}
                  onClick={() => goTo(idx)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 16px 8px 20px",
                    fontSize: 13,
                    background: isCurrent ? "rgba(0,230,118,0.15)" : "transparent",
                    borderLeft: isCurrent ? "3px solid #00E676" : "3px solid transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent)
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent)
                      (e.currentTarget as HTMLElement).style.background = "transparent"
                  }}
                >
                  <span style={{ fontFamily: "monospace", color: "#888" }}>{t.id}</span>
                  <br />
                  <span style={{ fontSize: 12, color: "#aaa" }}>{t.difficulty}</span>
                </button>
              )
            })}
          </div>
        ))}
      </aside>

      {/* Main area */}
      <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        {currentTest && (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
                flexWrap: "wrap",
              }}
            >
              <span
                className={`${CATEGORY_COLORS[currentTest.category] || "bg-gray-500/20 text-gray-400"}`}
                style={{
                  padding: "4px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "1px solid",
                }}
              >
                {CATEGORY_LABELS[currentTest.category] || currentTest.category}
              </span>
              <span style={{ fontFamily: "monospace", color: "#888" }}>{currentTest.id}</span>
              <span style={{ color: "#555" }}>|</span>
              <span style={{ color: "#999" }}>{currentTest.difficulty}</span>
              <span style={{ marginLeft: "auto", color: "#666", fontSize: 14 }}>
                {currentIndex + 1} / {allTests.length}
              </span>
            </div>

            {/* Renderer */}
            <div
              style={{
                background: "#0F3460",
                borderRadius: 16,
                padding: 32,
                marginBottom: 24,
                minHeight: 300,
              }}
            >
              {Renderer ? (
                <div key={resetKey}>
                  <Renderer task={currentTest} onAnswer={handleAnswer} />
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#888" }}>
                  Unknown render mode: <code>{mode}</code>
                  <pre
                    style={{
                      marginTop: 16,
                      textAlign: "left",
                      fontSize: 12,
                      background: "rgba(0,0,0,0.3)",
                      padding: 16,
                      borderRadius: 8,
                      overflow: "auto",
                      maxHeight: 400,
                    }}
                  >
                    {JSON.stringify(currentTest, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Answer result */}
            {answer && (
              <div
                style={{
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 24,
                  background: answer.isCorrect
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(239,68,68,0.15)",
                  border: `1px solid ${answer.isCorrect ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: answer.isCorrect ? "#4ade80" : "#f87171",
                  }}
                >
                  {answer.isCorrect ? "Correct!" : "Wrong"}
                </div>
                <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.8 }}>
                  <div>
                    <span style={{ color: "#888" }}>Your answer: </span>
                    <span style={{ fontFamily: "monospace" }}>{String(answer.selected)}</span>
                  </div>
                  <div>
                    <span style={{ color: "#888" }}>Correct answer: </span>
                    <span style={{ fontFamily: "monospace" }}>{formatCorrectAnswer(currentTest)}</span>
                  </div>
                  {currentTest.explanation && (
                    <div style={{ marginTop: 8, color: "#999", fontStyle: "italic" }}>
                      {currentTest.explanation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="min-h-btn"
                style={{
                  borderRadius: 12,
                  background: "#0F3460",
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#fff",
                  border: "none",
                  cursor: currentIndex === 0 ? "default" : "pointer",
                  opacity: currentIndex === 0 ? 0.3 : 1,
                }}
              >
                Previous
              </button>
              <button
                onClick={handleReset}
                className="min-h-btn"
                style={{
                  borderRadius: 12,
                  background: "#0F3460",
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === allTests.length - 1}
                className="min-h-btn"
                style={{
                  borderRadius: 12,
                  background: "#0F3460",
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#fff",
                  border: "none",
                  cursor: currentIndex === allTests.length - 1 ? "default" : "pointer",
                  opacity: currentIndex === allTests.length - 1 ? 0.3 : 1,
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
