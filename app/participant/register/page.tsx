import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { ParticipantForm } from "@/components/forms/ParticipantForm"

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="relative flex min-h-[calc(100vh-65px)] overflow-hidden">
        {/* Left banner area */}
        <div className="hidden lg:flex lg:w-1/3 relative items-end p-8">
          <Image
            src="/images/overhead-press.jpg"
            alt=""
            fill
            className="object-cover opacity-40 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/60 to-surface pointer-events-none" />
          <div className="relative z-10 border-l-4 border-accent pl-4 mb-12">
            <p className="text-lg font-bold text-white/80 leading-snug">
              Ты уже сильный. А насколько ты умный,
              <span className="text-accent"> когда устал?</span>
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-lg">
            {/* Mobile banner */}
            <div className="lg:hidden mb-6 border-l-4 border-accent pl-4">
              <p className="text-sm font-bold text-white/70 leading-snug">
                Ты уже сильный. А насколько ты умный,
                <span className="text-accent"> когда устал?</span>
              </p>
            </div>
            <ParticipantForm />
          </div>
        </div>
      </main>
    </>
  )
}
