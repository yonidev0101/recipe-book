import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryCardSkeleton() {
  return (
    <Card className="recipe-card h-full group">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
    </Card>
  )
}
