import { Header } from "@/components/layout/Header"
import { ResultsView } from "@/components/results/ResultsView"

export default function ResultsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Расшифровка результатов</h1>
        <ResultsView />
      </main>
    </>
  )
}
