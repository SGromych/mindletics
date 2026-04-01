import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  registered: "bg-gray-600 text-gray-200",
  in_progress: "bg-blue-600 text-white",
  finished: "bg-green-600 text-white",
  aborted: "bg-red-600 text-white",
}

const labels: Record<string, string> = {
  registered: "Ожидание",
  in_progress: "В процессе",
  finished: "Финиш",
  aborted: "Не завершил",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", styles[status] || "bg-gray-600")}>
      {labels[status] || status}
    </span>
  )
}
