"use client"

import { useState, useCallback } from "react"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (v: unknown) => void
  mode6x6?: boolean
}

export function SudokuGridRenderer({ task, onAnswer, mode6x6 }: Props) {
  if (mode6x6 || task.render?.mode === "sudoku_6x6_grid") {
    return <Sudoku6x6 task={task} onAnswer={onAnswer} />
  }
  return <SudokuClassic task={task} onAnswer={onAnswer} />
}

// --- Classic 9x9 single-cell sudoku ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SudokuClassic({ task, onAnswer }: { task: any; onAnswer: (v: string) => void }) {
  const { grid, target_cell } = task.payload
  const [targetRow, targetCol] = target_cell as [number, number]
  const options: string[] = task.options

  const CELL = 42

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-bold text-center">{task.prompt_text}</p>

      <div
        className="inline-grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(9, ${CELL}px)`,
          gridTemplateRows: `repeat(9, ${CELL}px)`,
          border: "3px solid #888",
        }}
      >
        {grid.map((row: number[], r: number) =>
          row.map((val: number, c: number) => {
            const isTarget = r === targetRow && c === targetCol
            const rightBorder = (c + 1) % 3 === 0 && c < 8
            const bottomBorder = (r + 1) % 3 === 0 && r < 8

            return (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center text-lg font-bold ${
                  isTarget
                    ? "bg-accent/30 ring-2 ring-accent"
                    : val === 0
                      ? "bg-surface"
                      : "bg-surface-card"
                }`}
                style={{
                  width: CELL,
                  height: CELL,
                  borderRight: rightBorder ? "3px solid #888" : "1px solid #444",
                  borderBottom: bottomBorder ? "3px solid #888" : "1px solid #444",
                }}
              >
                {isTarget ? (
                  <span className="text-accent text-2xl font-black">?</span>
                ) : val !== 0 ? (
                  <span className="text-white">{val}</span>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="min-h-btn rounded-xl bg-surface-card px-6 py-4 text-2xl font-black transition hover:bg-accent hover:text-black active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// --- 6x6 full-grid sudoku (sudoku-royal style) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Sudoku6x6({ task, onAnswer }: { task: any; onAnswer: (v: unknown) => void }) {
  const { grid, solution } = task.payload as { grid: number[][]; solution: number[][] }

  const [userGrid, setUserGrid] = useState<number[][]>(() =>
    grid.map((row) => [...row])
  )
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  const isPreset = useCallback((r: number, c: number) => grid[r][c] !== 0, [grid])

  // Check if a value conflicts in row, col, or block
  const hasConflict = useCallback((g: number[][], r: number, c: number, val: number): boolean => {
    if (val === 0) return false
    // Row
    for (let cc = 0; cc < 6; cc++) {
      if (cc !== c && g[r][cc] === val) return true
    }
    // Column
    for (let rr = 0; rr < 6; rr++) {
      if (rr !== r && g[rr][c] === val) return true
    }
    // 2x3 block
    const br = Math.floor(r / 2) * 2
    const bc = Math.floor(c / 3) * 3
    for (let rr = br; rr < br + 2; rr++) {
      for (let cc = bc; cc < bc + 3; cc++) {
        if (rr !== r && cc !== c && g[rr][cc] === val) return true
      }
    }
    return false
  }, [])

  // Recompute all errors
  const recomputeErrors = useCallback((g: number[][]): Set<string> => {
    const errs = new Set<string>()
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (g[r][c] !== 0 && !isPreset(r, c) && hasConflict(g, r, c, g[r][c])) {
          errs.add(`${r},${c}`)
        }
      }
    }
    return errs
  }, [isPreset, hasConflict])

  const handleCellClick = useCallback((r: number, c: number) => {
    setSelected([r, c])
  }, [])

  const handleDigit = useCallback((digit: number) => {
    if (!selected) return
    const [r, c] = selected
    if (isPreset(r, c)) return

    setUserGrid((prev) => {
      const next = prev.map((row) => [...row])
      next[r][c] = digit
      setErrors(recomputeErrors(next))

      // Check completion
      const allFilled = next.every((row) => row.every((v) => v !== 0))
      if (allFilled) {
        const isCorrect = next.every((row, rr) =>
          row.every((v, cc) => v === solution[rr][cc])
        )
        // Delay slightly so state updates render first
        setTimeout(() => onAnswer(isCorrect ? "correct" : "wrong"), 300)
      }
      return next
    })
  }, [selected, isPreset, solution, onAnswer, recomputeErrors])

  const handleErase = useCallback(() => {
    if (!selected) return
    const [r, c] = selected
    if (isPreset(r, c)) return

    setUserGrid((prev) => {
      const next = prev.map((row) => [...row])
      next[r][c] = 0
      setErrors(recomputeErrors(next))
      return next
    })
  }, [selected, isPreset, recomputeErrors])

  // Determine highlight context
  const selectedVal = selected ? userGrid[selected[0]][selected[1]] : 0
  const selectedBlock = selected
    ? [Math.floor(selected[0] / 2) * 2, Math.floor(selected[1] / 3) * 3]
    : null

  const CELL = 52

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-lg font-bold text-center">{task.prompt_text}</p>

      {/* Grid */}
      <div
        className="inline-grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(6, ${CELL}px)`,
          gridTemplateRows: `repeat(6, ${CELL}px)`,
          border: "4px solid #f0b572",
          borderRadius: 6,
        }}
      >
        {userGrid.map((row, r) =>
          row.map((val, c) => {
            const preset = isPreset(r, c)
            const isSelected = selected?.[0] === r && selected?.[1] === c
            const isError = errors.has(`${r},${c}`)
            const isSameValue = selectedVal !== 0 && val === selectedVal && !isSelected
            const inSameRow = selected?.[0] === r && !isSelected
            const inSameCol = selected?.[1] === c && !isSelected
            const inSameBlock = selectedBlock
              ? r >= selectedBlock[0] && r < selectedBlock[0] + 2
                && c >= selectedBlock[1] && c < selectedBlock[1] + 3
                && !isSelected
              : false
            const isHighlightZone = inSameRow || inSameCol || inSameBlock

            // Block borders (2x3)
            const rightThick = (c + 1) % 3 === 0 && c < 5
            const bottomThick = (r + 1) % 2 === 0 && r < 5

            // Background color priority: selected > error > same value > zone > default
            let bg = "#1e1e3a" // dark default
            if (isSelected) bg = "#3a2a00"
            else if (isError) bg = "rgba(255, 60, 60, 0.2)"
            else if (isSameValue) bg = "rgba(0, 200, 255, 0.15)"
            else if (isHighlightZone) bg = "rgba(255, 165, 0, 0.08)"
            else if (preset) bg = "#1a1a35"

            // Text color
            let textColor = "#fff"
            if (isError && !preset) textColor = "#ff4444"
            else if (!preset && val !== 0) textColor = "#00E676"
            else if (preset) textColor = "#bbb"

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  width: CELL,
                  height: CELL,
                  background: bg,
                  borderRight: rightThick ? "3px solid #f0b572" : "1px solid #444",
                  borderBottom: bottomThick ? "3px solid #f0b572" : "1px solid #444",
                  color: textColor,
                  fontSize: CELL * 0.5,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  position: "relative",
                  transition: "background 0.15s",
                  outline: isSelected ? "3px solid #f90" : "none",
                  outlineOffset: -3,
                }}
              >
                {val !== 0 ? val : ""}
              </div>
            )
          })
        )}
      </div>

      {/* Digit palette + erase */}
      <div className="flex gap-2 items-center">
        {[1, 2, 3, 4, 5, 6].map((d) => {
          // Count how many of this digit are placed
          const placed = userGrid.flat().filter((v) => v === d).length
          const allPlaced = placed >= 6
          return (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              disabled={allPlaced}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                fontSize: 24,
                fontWeight: 900,
                border: "none",
                cursor: allPlaced ? "default" : "pointer",
                opacity: allPlaced ? 0.25 : 1,
                background: selectedVal === d ? "#f0b572" : "#2a2a4a",
                color: selectedVal === d ? "#000" : "#fff",
                transition: "all 0.15s",
              }}
            >
              {d}
            </button>
          )
        })}
        <button
          onClick={handleErase}
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            background: "#3a1a1a",
            color: "#ff6b6b",
            transition: "all 0.15s",
          }}
        >
          X
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Нажмите клетку, затем цифру. Ошибки подсвечиваются красным.
      </p>
    </div>
  )
}
