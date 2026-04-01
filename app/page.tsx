import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      {/* Background image — pinned right, visible */}
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none">
        <Image
          src="/images/hero-deadlift.jpg"
          alt=""
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="mb-3 text-6xl font-black tracking-tighter uppercase">MINDLETICS</h1>

        {/* Banner slogan */}
        <div className="mb-10 border-l-4 border-accent pl-4 max-w-xl">
          <p className="text-xl font-bold text-white/90 leading-snug">
            Первый в мире спорт, где побеждает не только сила,
            <span className="text-accent"> но и ясность ума.</span>
          </p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
          <Link
            href="/event/new"
            className="flex min-h-btn items-center justify-center rounded-xl bg-surface-card px-6 py-5 text-center text-lg font-bold transition hover:bg-surface-light"
          >
            Создать событие
          </Link>
          <Link
            href="/participant/register"
            className="flex min-h-btn items-center justify-center rounded-xl bg-accent px-6 py-5 text-center text-lg font-bold text-black transition hover:bg-accent-dark"
          >
            Регистрация участника
          </Link>
          <Link
            href="/live/select"
            className="flex min-h-btn items-center justify-center rounded-xl bg-surface-card px-6 py-5 text-center text-lg font-bold transition hover:bg-surface-light"
          >
            Live табло
          </Link>
          <Link
            href="/leaderboards"
            className="flex min-h-btn items-center justify-center rounded-xl bg-surface-card px-6 py-5 text-center text-lg font-bold transition hover:bg-surface-light"
          >
            Лидерборды
          </Link>
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-white/30">
          Беги. Тягай. Думай. Побеждай.
        </p>
      </div>
    </main>
  )
}
