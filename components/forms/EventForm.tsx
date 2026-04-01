"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export function EventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ id: string; eventName: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hallName: form.get("hallName"),
        eventName: form.get("eventName"),
        eventDate: form.get("eventDate"),
      }),
    })

    if (res.ok) {
      const event = await res.json()
      setCreated(event)
    }
    setLoading(false)
  }

  if (created) {
    return (
      <Card className="w-full max-w-lg text-center">
        <h2 className="mb-4 text-2xl font-bold text-accent">Событие создано!</h2>
        <p className="mb-6 text-xl">{created.eventName}</p>
        <div className="flex gap-4">
          <Button variant="secondary" fullWidth onClick={() => router.push("/")}>
            Главная
          </Button>
          <Button fullWidth onClick={() => router.push(`/live/${created.id}`)}>
            Live табло
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">Создать событие</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Название зала</span>
          <input
            name="hallName"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Название события</span>
          <input
            name="eventName"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Дата</span>
          <input
            name="eventDate"
            type="date"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Создание..." : "Создать событие"}
        </Button>
      </form>
    </Card>
  )
}
