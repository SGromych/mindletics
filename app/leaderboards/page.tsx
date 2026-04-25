"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Filters } from "@/components/leaderboard/Filters"
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable"

interface FilterValues {
  scope: "all" | "last" | "event"
  eventId: string
  heat: string
  gender: string
  ageMin: string
  ageMax: string
  mode: string
}

export default function LeaderboardsPage() {
  const [filters, setFilters] = useState<FilterValues>({
    scope: "all",
    eventId: "",
    heat: "",
    gender: "",
    ageMin: "",
    ageMax: "",
    mode: "",
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.scope === "last") params.set("scope", "last")
    if (filters.scope === "event" && filters.eventId) params.set("eventId", filters.eventId)
    if (filters.heat) params.set("heat", filters.heat)
    if (filters.gender) params.set("gender", filters.gender)
    if (filters.ageMin) params.set("ageMin", filters.ageMin)
    if (filters.ageMax) params.set("ageMax", filters.ageMax)
    if (filters.mode) params.set("mode", filters.mode)

    const res = await fetch(`/api/leaderboards?${params}`)
    if (res.ok) setRows(await res.json())
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <>
      <Header />
      <main className="relative min-h-[calc(100vh-65px)] overflow-hidden">
        <div className="absolute bottom-0 right-0 w-2/5 h-3/4 pointer-events-none">
          <Image
            src="/images/barbell-power.jpg"
            alt=""
            fill
            className="object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-surface/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl p-6">
          {/* Banner slogan */}
          <div className="mb-6 border-l-4 border-accent pl-4">
            <h1 className="text-2xl font-bold text-white">Лидерборды</h1>
            <p className="mt-1 text-sm font-semibold text-white/50 leading-snug">
              После Mindletics ты уже не будешь прежним. Узнай, на что способен,
              когда тело кричит <span className="text-accent/70">&laquo;стоп&raquo;</span>, а мозг говорит <span className="text-accent/70">&laquo;решай&raquo;</span>.
            </p>
          </div>

          <Filters value={filters} onChange={setFilters} />
          <div className="mt-6">
            <LeaderboardTable rows={rows} />
          </div>
        </div>
      </main>
    </>
  )
}
