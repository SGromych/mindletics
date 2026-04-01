"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Card } from "@/components/ui/Card"

interface EventItem {
  id: string
  eventName: string
  hallName: string
  eventDate: string
}

export default function LiveSelectPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents)
  }, [])

  return (
    <>
      <Header />
      <main className="relative min-h-[calc(100vh-65px)] overflow-hidden">
        <div className="absolute bottom-0 right-0 w-2/5 h-3/4 pointer-events-none">
          <Image
            src="/images/jump-rope.jpg"
            alt=""
            fill
            className="object-cover object-top opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-surface/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl p-6">
          {/* Banner slogan */}
          <div className="mb-6 border-l-4 border-accent pl-4">
            <h1 className="text-2xl font-bold text-white">Live табло</h1>
            <p className="mt-1 text-sm font-semibold text-white/50 leading-snug">
              Сможешь ли ты мыслить чётко,
              <span className="text-accent/70"> когда всё горит?</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {events.map((ev) => (
              <Card
                key={ev.id}
                className="cursor-pointer transition hover:bg-surface-light"
              >
                <button onClick={() => router.push(`/live/${ev.id}`)} className="w-full text-left">
                  <p className="text-xl font-bold">{ev.eventName}</p>
                  <p className="text-gray-400">{ev.hallName} — {new Date(ev.eventDate).toLocaleDateString()}</p>
                </button>
              </Card>
            ))}
            {events.length === 0 && (
              <p className="text-center text-gray-500">Событий пока нет. Создайте первое.</p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
