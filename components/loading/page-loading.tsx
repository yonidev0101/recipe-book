import { LoadingSpinner } from "./loading-spinner"

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = "טוען..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" className="text-primary" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  )
}
