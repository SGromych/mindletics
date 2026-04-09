// TEMPORARY DEBUG PAGE — remove once the spatial renderer is verified.
"use client"

import spatialData from "@/data/tests/spatial.json"
import { IsometricRenderer } from "@/components/tests/IsometricRenderer"
import { TopViewGrid } from "@/components/tests/TopViewGrid"

interface SpatialTask {
  id: string
  difficulty: string
  payload: {
    blocks: number[][]
    correct_top_view: number[][]
  }
  correct_answer: string
}

function deriveTopView(blocks: number[][]): number[][] {
  const set = new Set<string>()
  for (const [x, y] of blocks) set.add(`${x},${y}`)
  return Array.from(set)
    .map((k) => k.split(",").map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

function sameCellSet(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false
  const sa = new Set(a.map((c) => `${c[0]},${c[1]}`))
  for (const c of b) if (!sa.has(`${c[0]},${c[1]}`)) return false
  return true
}

export default function DebugSpatialPage() {
  const items = (spatialData as { items: SpatialTask[] }).items

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Debug: Spatial renderer</h1>
        <p className="text-sm text-gray-400">
          Временная страница для визуальной проверки изометрического рендера.
          Слева — 3D-рендер (painter&apos;s order), справа — ожидаемый вид сверху.
          Зелёная галочка — данные consistent (derived top view = correct_top_view).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((task) => {
          const derived = deriveTopView(task.payload.blocks)
          const dataOk = sameCellSet(derived, task.payload.correct_top_view)
          return (
            <div
              key={task.id}
              className="rounded-xl bg-surface-card p-4 ring-1 ring-white/10"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-sm text-gray-400">{task.id}</span>
                <span className="text-xs text-gray-500">{task.difficulty}</span>
                <span className={dataOk ? "text-green-400" : "text-red-400"}>
                  {dataOk ? "✓ data ok" : "✗ data mismatch"}
                </span>
              </div>

              <div className="flex items-center justify-around gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-500">3D</div>
                  <div className="rounded-lg bg-black/20 p-3">
                    <IsometricRenderer blocks={task.payload.blocks} size={180} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-500">top view (correct)</div>
                  <TopViewGrid cells={task.payload.correct_top_view} size={120} />
                  <div className="text-xs text-accent">answer: {task.correct_answer}</div>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-gray-500">
                  blocks [x,y,z]
                </summary>
                <pre className="mt-2 overflow-x-auto text-xs text-gray-400">
                  {JSON.stringify(task.payload.blocks)}
                </pre>
              </details>
            </div>
          )
        })}
      </div>
    </div>
  )
}
