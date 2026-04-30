"use client"

import { useState, useCallback, useRef } from "react"

function parseFen(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/")
  const board: (string | null)[][] = []
  for (const row of rows) {
    const rank: (string | null)[] = []
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") {
        for (let i = 0; i < parseInt(ch); i++) rank.push(null)
      } else {
        rank.push(ch)
      }
    }
    board.push(rank)
  }
  return board
}

function algebraicToCoords(sq: string): [number, number] {
  const file = sq.charCodeAt(0) - 97
  const rank = parseInt(sq[1])
  return [8 - rank, file]
}

function coordsToAlgebraic(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row)
}

function parseMoveDest(move: string): string | null {
  if (move === "0-0" || move === "0-0-0" || move === "O-O" || move === "O-O-O") return null
  const clean = move.replace(/[+#!?]/g, "")
  const match = clean.match(/([a-h][1-8])$/)
  return match ? match[1] : null
}

function findMoveSource(
  board: (string | null)[][],
  move: string,
  orientation: string
): string | null {
  if (move === "0-0" || move === "0-0-0" || move === "O-O" || move === "O-O-O") return null
  const clean = move.replace(/[+#!?]/g, "").replace(/x/g, "")
  const dest = parseMoveDest(move)
  if (!dest) return null

  const isWhite = orientation === "white"

  let pieceChar: string
  const firstChar = clean[0]
  if (firstChar >= "A" && firstChar <= "Z" && firstChar !== "O") {
    pieceChar = isWhite ? firstChar : firstChar.toLowerCase()
  } else {
    pieceChar = isWhite ? "P" : "p"
  }

  let sourceFileHint: number | null = null
  if ((pieceChar === "P" || pieceChar === "p") && firstChar >= "a" && firstChar <= "h") {
    sourceFileHint = firstChar.charCodeAt(0) - 97
  }

  let disambigFile: number | null = null
  let disambigRank: number | null = null
  if (firstChar >= "A" && firstChar <= "Z") {
    const afterPiece = clean.substring(1, clean.length - 2)
    if (afterPiece.length === 1) {
      if (afterPiece[0] >= "a" && afterPiece[0] <= "h") {
        disambigFile = afterPiece.charCodeAt(0) - 97
      } else if (afterPiece[0] >= "1" && afterPiece[0] <= "8") {
        disambigRank = 8 - parseInt(afterPiece[0])
      }
    }
  }

  const [destR, destC] = algebraicToCoords(dest)
  const candidates: string[] = []

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== pieceChar) continue
      if (r === destR && c === destC) continue
      if (sourceFileHint !== null && c !== sourceFileHint) continue
      if (disambigFile !== null && c !== disambigFile) continue
      if (disambigRank !== null && r !== disambigRank) continue
      candidates.push(coordsToAlgebraic(r, c))
    }
  }

  return candidates.length > 0 ? candidates[0] : null
}

// Generate pseudo-legal target squares for a piece at (r,c)
function getPseudoLegalMoves(
  board: (string | null)[][],
  r: number,
  c: number
): [number, number][] {
  const piece = board[r][c]
  if (!piece) return []

  const isWhite = piece === piece.toUpperCase()
  const isFriendly = (tr: number, tc: number) => {
    const target = board[tr]?.[tc]
    if (!target) return false
    return isWhite ? target === target.toUpperCase() : target === target.toLowerCase()
  }
  const inBounds = (tr: number, tc: number) => tr >= 0 && tr < 8 && tc >= 0 && tc < 8

  const moves: [number, number][] = []
  const p = piece.toUpperCase()

  if (p === "P") {
    const dir = isWhite ? -1 : 1
    const startRow = isWhite ? 6 : 1
    // Forward
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push([r + dir, c])
      if (r === startRow && !board[r + dir * 2][c]) {
        moves.push([r + dir * 2, c])
      }
    }
    // Captures
    for (const dc of [-1, 1]) {
      const tr = r + dir, tc = c + dc
      if (inBounds(tr, tc) && board[tr][tc] && !isFriendly(tr, tc)) {
        moves.push([tr, tc])
      }
    }
  } else if (p === "N") {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const tr = r + dr, tc = c + dc
      if (inBounds(tr, tc) && !isFriendly(tr, tc)) moves.push([tr, tc])
    }
  } else if (p === "K") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const tr = r + dr, tc = c + dc
        if (inBounds(tr, tc) && !isFriendly(tr, tc)) moves.push([tr, tc])
      }
    }
  } else {
    // Sliding pieces
    const dirs: [number, number][] = []
    if (p === "R" || p === "Q") dirs.push([-1,0],[1,0],[0,-1],[0,1])
    if (p === "B" || p === "Q") dirs.push([-1,-1],[-1,1],[1,-1],[1,1])
    for (const [dr, dc] of dirs) {
      let tr = r + dr, tc = c + dc
      while (inBounds(tr, tc)) {
        if (isFriendly(tr, tc)) break
        moves.push([tr, tc])
        if (board[tr][tc]) break // capture, stop sliding
        tr += dr
        tc += dc
      }
    }
  }

  return moves
}

// Apply a move to the board, returning a new board
function applyMove(
  board: (string | null)[][],
  fromSq: string,
  toSq: string
): (string | null)[][] {
  const newBoard = board.map((row) => [...row])
  const [fr, fc] = algebraicToCoords(fromSq)
  const [tr, tc] = algebraicToCoords(toSq)
  newBoard[tr][tc] = newBoard[fr][fc]
  newBoard[fr][fc] = null
  return newBoard
}

// SVG chess pieces — consistent rendering on all platforms
function PieceSvg({ piece, x, y, size }: { piece: string; x: number; y: number; size: number }) {
  const isWhite = piece === piece.toUpperCase()
  const fill = isWhite ? "#fff" : "#222"
  const stroke = isWhite ? "#222" : "#ccc"
  const sw = size * 0.03
  const cx = x + size / 2
  const cy = y + size / 2
  const s = size * 0.4
  const p = piece.toUpperCase()

  // Base plate common to all pieces
  const base = (w: number, h: number) => (
    <rect x={cx - w / 2} y={cy + s * 0.65} width={w} height={h} rx={h * 0.3} fill={fill} stroke={stroke} strokeWidth={sw} />
  )

  if (p === "K") {
    return (
      <g style={{ pointerEvents: "none" }}>
        {/* Cross */}
        <rect x={cx - s * 0.08} y={cy - s * 0.95} width={s * 0.16} height={s * 0.4} rx={1} fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x={cx - s * 0.2} y={cy - s * 0.85} width={s * 0.4} height={s * 0.16} rx={1} fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Body */}
        <path d={`M${cx - s * 0.5} ${cy + s * 0.6} L${cx - s * 0.35} ${cy - s * 0.1} Q${cx - s * 0.3} ${cy - s * 0.5} ${cx} ${cy - s * 0.55} Q${cx + s * 0.3} ${cy - s * 0.5} ${cx + s * 0.35} ${cy - s * 0.1} L${cx + s * 0.5} ${cy + s * 0.6} Z`}
          fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Waist line */}
        <line x1={cx - s * 0.35} y1={cy + s * 0.15} x2={cx + s * 0.35} y2={cy + s * 0.15} stroke={stroke} strokeWidth={sw} />
        {base(s * 1.15, s * 0.18)}
      </g>
    )
  }
  if (p === "Q") {
    return (
      <g style={{ pointerEvents: "none" }}>
        {/* Ball on top */}
        <circle cx={cx} cy={cy - s * 0.8} r={s * 0.12} fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Crown points */}
        <polygon
          points={`${cx - s * 0.55},${cy + s * 0.15} ${cx - s * 0.5},${cy - s * 0.55} ${cx - s * 0.25},${cy - s * 0.1} ${cx},${cy - s * 0.65} ${cx + s * 0.25},${cy - s * 0.1} ${cx + s * 0.5},${cy - s * 0.55} ${cx + s * 0.55},${cy + s * 0.15}`}
          fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Body */}
        <path d={`M${cx - s * 0.55} ${cy + s * 0.15} Q${cx - s * 0.55} ${cy + s * 0.65} ${cx} ${cy + s * 0.65} Q${cx + s * 0.55} ${cy + s * 0.65} ${cx + s * 0.55} ${cy + s * 0.15}`}
          fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Dots on points */}
        <circle cx={cx - s * 0.5} cy={cy - s * 0.55} r={s * 0.07} fill={fill} stroke={stroke} strokeWidth={sw * 0.7} />
        <circle cx={cx} cy={cy - s * 0.65} r={s * 0.07} fill={fill} stroke={stroke} strokeWidth={sw * 0.7} />
        <circle cx={cx + s * 0.5} cy={cy - s * 0.55} r={s * 0.07} fill={fill} stroke={stroke} strokeWidth={sw * 0.7} />
        {base(s * 1.2, s * 0.18)}
      </g>
    )
  }
  if (p === "R") {
    return (
      <g style={{ pointerEvents: "none" }}>
        {/* Battlements */}
        <path d={`M${cx - s * 0.45} ${cy - s * 0.6} L${cx - s * 0.45} ${cy - s * 0.85} L${cx - s * 0.25} ${cy - s * 0.85} L${cx - s * 0.25} ${cy - s * 0.65} L${cx - s * 0.1} ${cy - s * 0.65} L${cx - s * 0.1} ${cy - s * 0.85} L${cx + s * 0.1} ${cy - s * 0.85} L${cx + s * 0.1} ${cy - s * 0.65} L${cx + s * 0.25} ${cy - s * 0.65} L${cx + s * 0.25} ${cy - s * 0.85} L${cx + s * 0.45} ${cy - s * 0.85} L${cx + s * 0.45} ${cy - s * 0.6} Z`}
          fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Tower body */}
        <rect x={cx - s * 0.35} y={cy - s * 0.6} width={s * 0.7} height={s * 1.25} fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Top ledge */}
        <rect x={cx - s * 0.48} y={cy - s * 0.6} width={s * 0.96} height={s * 0.15} rx={1} fill={fill} stroke={stroke} strokeWidth={sw} />
        {base(s * 1.1, s * 0.18)}
      </g>
    )
  }
  if (p === "B") {
    return (
      <g style={{ pointerEvents: "none" }}>
        {/* Top dot */}
        <circle cx={cx} cy={cy - s * 0.85} r={s * 0.08} fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Mitre shape */}
        <path d={`M${cx} ${cy - s * 0.75} Q${cx - s * 0.45} ${cy - s * 0.3} ${cx - s * 0.35} ${cy + s * 0.3} Q${cx - s * 0.3} ${cy + s * 0.6} ${cx} ${cy + s * 0.65} Q${cx + s * 0.3} ${cy + s * 0.6} ${cx + s * 0.35} ${cy + s * 0.3} Q${cx + s * 0.45} ${cy - s * 0.3} ${cx} ${cy - s * 0.75} Z`}
          fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Slash */}
        <line x1={cx - s * 0.15} y1={cy + s * 0.1} x2={cx + s * 0.15} y2={cy - s * 0.35} stroke={stroke} strokeWidth={sw * 1.2} />
        {base(s * 1.0, s * 0.18)}
      </g>
    )
  }
  if (p === "N") {
    // Classic knight silhouette — recognizable horse head facing left
    const ox = cx - s * 0.05
    const oy = cy + s * 0.05
    return (
      <g style={{ pointerEvents: "none" }}>
        <path d={[
          // Start at bottom-left of neck
          `M${ox - s * 0.35} ${oy + s * 0.6}`,
          // Up the back of neck
          `L${ox - s * 0.3} ${oy - s * 0.1}`,
          // Curve up to top of head (ears area)
          `C${ox - s * 0.3} ${oy - s * 0.55} ${ox - s * 0.15} ${oy - s * 0.85} ${ox + s * 0.05} ${oy - s * 0.85}`,
          // Right ear tip
          `L${ox + s * 0.15} ${oy - s * 0.95}`,
          // Down between ears
          `L${ox + s * 0.1} ${oy - s * 0.75}`,
          // Left ear tip
          `L${ox - s * 0.05} ${oy - s * 0.9}`,
          // Back to head top
          `L${ox + s * 0.05} ${oy - s * 0.75}`,
          // Forehead curve down to nose
          `C${ox + s * 0.25} ${oy - s * 0.7} ${ox + s * 0.35} ${oy - s * 0.55} ${ox + s * 0.35} ${oy - s * 0.4}`,
          // Nose/muzzle
          `L${ox + s * 0.45} ${oy - s * 0.35}`,
          `L${ox + s * 0.4} ${oy - s * 0.25}`,
          // Jaw line — under chin
          `C${ox + s * 0.3} ${oy - s * 0.15} ${ox + s * 0.25} ${oy + s * 0.05} ${ox + s * 0.35} ${oy + s * 0.2}`,
          // Down to chest/base
          `C${ox + s * 0.45} ${oy + s * 0.35} ${ox + s * 0.45} ${oy + s * 0.5} ${ox + s * 0.4} ${oy + s * 0.6}`,
          `Z`,
        ].join(" ")}
          fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        {/* Eye */}
        <circle cx={ox + s * 0.15} cy={oy - s * 0.5} r={s * 0.055} fill={stroke} />
        {/* Nostril */}
        <circle cx={ox + s * 0.35} cy={oy - s * 0.32} r={s * 0.035} fill={stroke} />
        {/* Mane lines on neck */}
        <path d={`M${ox - s * 0.25} ${oy - s * 0.4} Q${ox - s * 0.15} ${oy - s * 0.25} ${ox - s * 0.28} ${oy - s * 0.1}`}
          fill="none" stroke={stroke} strokeWidth={sw * 0.8} />
        <path d={`M${ox - s * 0.22} ${oy - s * 0.15} Q${ox - s * 0.1} ${oy + s * 0.0} ${ox - s * 0.25} ${oy + s * 0.15}`}
          fill="none" stroke={stroke} strokeWidth={sw * 0.8} />
        {base(s * 1.0, s * 0.18)}
      </g>
    )
  }
  // Pawn
  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Head */}
      <circle cx={cx} cy={cy - s * 0.4} r={s * 0.28} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Neck */}
      <rect x={cx - s * 0.12} y={cy - s * 0.15} width={s * 0.24} height={s * 0.2} fill={fill} stroke={stroke} strokeWidth={sw * 0.5} />
      {/* Body */}
      <path d={`M${cx - s * 0.15} ${cy + s * 0.05} Q${cx - s * 0.45} ${cy + s * 0.5} ${cx - s * 0.45} ${cy + s * 0.65} L${cx + s * 0.45} ${cy + s * 0.65} Q${cx + s * 0.45} ${cy + s * 0.5} ${cx + s * 0.15} ${cy + s * 0.05} Z`}
        fill={fill} stroke={stroke} strokeWidth={sw} />
      {base(s * 1.0, s * 0.18)}
    </g>
  )
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any
  onAnswer: (v: string) => void
}

export function ChessBoardRenderer({ task, onAnswer }: Props) {
  const { fen, orientation } = task.payload
  const initialBoard = parseFen(fen)
  const correctAnswer: string = task.correct_answer
  const options: string[] = task.options

  const isFlipped = orientation === "black"

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [displayBoardState, setDisplayBoardState] = useState<(string | null)[][] | null>(null)
  const [moveResult, setMoveResult] = useState<{ correct: boolean; fromSq: string; toSq: string } | null>(null)
  const lockedRef = useRef(false)

  // The board to render: either the moved board or the initial one
  const currentBoard = displayBoardState || initialBoard
  const renderBoard = isFlipped ? [...currentBoard].reverse().map((r) => [...r].reverse()) : currentBoard

  // Precompute option source squares (for matching user moves to option notation)
  const moveMap = options.map((move) => ({
    move,
    from: findMoveSource(initialBoard, move, orientation),
    to: parseMoveDest(move),
  }))

  // Pseudo-legal moves for the selected piece
  const legalTargets: [number, number][] = selectedSquare
    ? (() => {
        const [r, c] = algebraicToCoords(selectedSquare)
        return getPseudoLegalMoves(initialBoard, r, c)
      })()
    : []
  const legalTargetSquares = legalTargets.map(([r, c]) => coordsToAlgebraic(r, c))

  // Highlight squares that are option targets (hint dots)
  const optionTargetsForSelected = selectedSquare
    ? moveMap.filter((m) => m.from === selectedSquare).map((m) => m.to)
    : []

  const executeMove = useCallback((fromSq: string, toSq: string) => {
    if (lockedRef.current) return
    lockedRef.current = true

    // Apply move visually
    const newBoard = applyMove(initialBoard, fromSq, toSq)
    setDisplayBoardState(newBoard)
    setSelectedSquare(null)

    // Check if this move matches the correct answer
    const matchedOption = moveMap.find((m) => m.from === fromSq && m.to === toSq)
    const isCorrect = matchedOption ? matchedOption.move === correctAnswer : false

    setMoveResult({ correct: isCorrect, fromSq, toSq })

    // After delay, send answer
    setTimeout(() => {
      onAnswer(matchedOption ? matchedOption.move : "__wrong__")
      // Reset state for next task
      lockedRef.current = false
      setDisplayBoardState(null)
      setMoveResult(null)
    }, 1200)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBoard, moveMap, correctAnswer, onAnswer])

  const handleCellClick = useCallback((sq: string) => {
    if (lockedRef.current) return

    if (selectedSquare) {
      // Check if this is a legal target
      if (legalTargetSquares.includes(sq)) {
        executeMove(selectedSquare, sq)
        return
      }
      // Check if clicking another own piece
      const [r, c] = algebraicToCoords(sq)
      const piece = initialBoard[r]?.[c]
      const isPlayerPiece = piece && (orientation === "white" ? piece === piece.toUpperCase() : piece === piece.toLowerCase())
      if (isPlayerPiece) {
        setSelectedSquare(sq)
        return
      }
      setSelectedSquare(null)
      return
    }
    // Select a piece
    const [r, c] = algebraicToCoords(sq)
    const piece = initialBoard[r]?.[c]
    const isPlayerPiece = piece && (orientation === "white" ? piece === piece.toUpperCase() : piece === piece.toLowerCase())
    if (isPlayerPiece) {
      setSelectedSquare(sq)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSquare, initialBoard, orientation, legalTargetSquares, executeMove])

  const CELL = 56
  const BOARD_SIZE = CELL * 8
  const MARGIN = 20
  const files = isFlipped ? "hgfedcba" : "abcdefgh"
  const ranks = isFlipped ? "12345678" : "87654321"

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-lg font-bold text-center">{task.prompt_text}</p>
      {!moveResult && (
        <p className="text-sm text-gray-400">
          {orientation === "white" ? "Ход белых" : "Ход чёрных"}
          {" — нажмите на фигуру, затем на клетку хода"}
        </p>
      )}

      {/* Move result overlay */}
      {moveResult && (
        <div
          className={`rounded-xl px-8 py-3 text-xl font-black ${
            moveResult.correct
              ? "bg-green-500/20 text-green-400 ring-2 ring-green-500/50"
              : "bg-red-500/20 text-red-400 ring-2 ring-red-500/50"
          }`}
        >
          {moveResult.correct ? "Верно!" : "Ошибка!"}
        </div>
      )}

      <svg
        width={BOARD_SIZE + MARGIN * 2}
        height={BOARD_SIZE + MARGIN * 2}
        viewBox={`0 0 ${BOARD_SIZE + MARGIN * 2} ${BOARD_SIZE + MARGIN * 2}`}
        className="mx-auto touch-none"
      >
        {/* Rank labels */}
        {ranks.split("").map((r, i) => (
          <text key={`rank-${r}`} x={MARGIN / 2} y={MARGIN + i * CELL + CELL / 2} textAnchor="middle" fill="#aaa" fontSize={14} fontWeight={600} dominantBaseline="central">
            {r}
          </text>
        ))}
        {/* File labels */}
        {files.split("").map((f, i) => (
          <text key={`file-${f}`} x={MARGIN + i * CELL + CELL / 2} y={BOARD_SIZE + MARGIN + 18} textAnchor="middle" fill="#aaa" fontSize={14} fontWeight={600}>
            {f}
          </text>
        ))}

        {/* Board squares, highlights, and pieces */}
        {renderBoard.map((row, r) =>
          row.map((piece, c) => {
            const isLight = (r + c) % 2 === 0
            const actualR = isFlipped ? 7 - r : r
            const actualC = isFlipped ? 7 - c : c
            const sq = coordsToAlgebraic(actualR, actualC)

            const isSelected = sq === selectedSquare
            const isLegalTarget = legalTargetSquares.includes(sq)
            const isOptionTarget = optionTargetsForSelected.includes(sq)

            // Move result highlights
            const isMoveFrom = moveResult?.fromSq === sq
            const isMoveTo = moveResult?.toSq === sq

            let cellColor = isLight ? "#e8d5b5" : "#a67b5b"
            if (moveResult) {
              if (isMoveTo) {
                cellColor = moveResult.correct
                  ? (isLight ? "#66bb6a" : "#43a047")
                  : (isLight ? "#ef5350" : "#c62828")
              } else if (isMoveFrom) {
                cellColor = isLight ? "#fff9c4" : "#d4c130"
              }
            } else if (isSelected) {
              cellColor = isLight ? "#f7ec73" : "#d4c130"
            } else if (isLegalTarget) {
              cellColor = isLight ? "#c8e6c9" : "#81c784"
            }

            return (
              <g
                key={`${r}-${c}`}
                onClick={() => handleCellClick(sq)}
                style={{ cursor: lockedRef.current ? "default" : "pointer" }}
              >
                <rect
                  x={MARGIN + c * CELL}
                  y={MARGIN + r * CELL}
                  width={CELL}
                  height={CELL}
                  fill={cellColor}
                />
                {/* Dot for legal empty targets */}
                {!moveResult && isLegalTarget && !piece && (
                  <circle
                    cx={MARGIN + c * CELL + CELL / 2}
                    cy={MARGIN + r * CELL + CELL / 2}
                    r={isOptionTarget ? CELL * 0.18 : CELL * 0.12}
                    fill={isOptionTarget ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)"}
                  />
                )}
                {/* Ring around capturable pieces */}
                {!moveResult && isLegalTarget && piece && (
                  <rect
                    x={MARGIN + c * CELL + 2}
                    y={MARGIN + r * CELL + 2}
                    width={CELL - 4}
                    height={CELL - 4}
                    fill="none"
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth={3}
                    rx={4}
                  />
                )}
                {piece && (
                  <PieceSvg piece={piece} x={MARGIN + c * CELL} y={MARGIN + r * CELL} size={CELL} />
                )}
              </g>
            )
          })
        )}
      </svg>

      {!moveResult && selectedSquare && (
        <button
          onClick={() => setSelectedSquare(null)}
          className="rounded-xl bg-surface-card px-6 py-3 text-sm font-bold transition hover:bg-surface-light"
        >
          Сбросить выбор
        </button>
      )}

      {/* Fallback text buttons for castling */}
      {!moveResult && options.some((o) => o.startsWith("0-0") || o.startsWith("O-O")) && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-2">
          {options
            .filter((o) => o.startsWith("0-0") || o.startsWith("O-O"))
            .map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  if (lockedRef.current) return
                  lockedRef.current = true
                  const isCorrect = opt === correctAnswer
                  setMoveResult({ correct: isCorrect, fromSq: "", toSq: "" })
                  setTimeout(() => {
                    onAnswer(opt)
                    lockedRef.current = false
                    setMoveResult(null)
                  }, 1200)
                }}
                className="min-h-btn rounded-xl bg-surface-card px-6 py-4 text-lg font-bold transition hover:bg-accent hover:text-black active:scale-95"
              >
                {opt}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
