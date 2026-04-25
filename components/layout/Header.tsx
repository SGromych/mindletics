import Link from "next/link"
import Image from "next/image"

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <Link href="/">
        <Image src="/mindletics_transparent2.png" alt="Mindletics" width={180} height={40} priority />
      </Link>
    </header>
  )
}
