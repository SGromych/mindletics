import { AttemptScreen } from "@/components/participant/AttemptScreen"

export default function AttemptPage({ params }: { params: { attemptId: string } }) {
  return <AttemptScreen attemptId={params.attemptId} />
}
