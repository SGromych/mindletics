import Link from "next/link"

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <Link href="/" className="text-2xl font-black tracking-tight">
        MINDLETICS
      </Link>
    </header>
  )
}
