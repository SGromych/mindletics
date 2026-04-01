import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { LiveTable } from "@/components/live/LiveTable"

export default function LivePage({ params }: { params: { eventId: string } }) {
  return (
    <>
      <Header />
      <main className="relative min-h-[calc(100vh-65px)] overflow-hidden">
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 pointer-events-none">
          <Image
            src="/images/assault-bike.jpg"
            alt=""
            fill
            className="object-cover object-top opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-surface/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl p-6">
          <LiveTable eventId={params.eventId} />
        </div>
      </main>
    </>
  )
}
