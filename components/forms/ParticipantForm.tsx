"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

interface EventOption {
  id: string
  eventName: string
  hallName: string
}

export function ParticipantForm() {
  const router = useRouter()
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/events?active=true")
      .then((r) => r.json())
      .then(setEvents)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        gender: form.get("gender"),
        age: Number(form.get("age")),
        bibNumber: form.get("bibNumber"),
        eventId: form.get("eventId"),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/attempt/${data.attemptId}`)
    } else {
      const data = await res.json()
      setError(data.error || "Ошибка регистрации")
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">Регистрация участника</h2>
      {error && <p className="mb-4 rounded-lg bg-red-900/50 p-3 text-red-300">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Ник</span>
          <input
            name="displayName"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Пол</span>
          <div className="flex gap-4">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface px-4 py-4 ring-1 ring-white/20 has-[:checked]:ring-2 has-[:checked]:ring-accent">
              <input type="radio" name="gender" value="male" required className="sr-only" />
              <span className="text-lg font-bold">Мужской</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface px-4 py-4 ring-1 ring-white/20 has-[:checked]:ring-2 has-[:checked]:ring-accent">
              <input type="radio" name="gender" value="female" className="sr-only" />
              <span className="text-lg font-bold">Женский</span>
            </label>
          </div>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Возраст</span>
          <input
            name="age"
            type="number"
            min={10}
            max={99}
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Номер дорожки атлета</span>
          <input
            name="bibNumber"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Событие</span>
          <select
            name="eventId"
            required
            className="min-h-[56px] rounded-xl bg-surface px-4 text-lg outline-none ring-1 ring-white/20 focus:ring-accent"
          >
            <option value="">Выберите событие...</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.eventName} — {ev.hallName}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
    </Card>
  )
}
