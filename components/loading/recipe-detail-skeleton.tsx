import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function RecipeDetailSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex-grow">
              <Skeleton className="h-10 w-3/4 mb-3" />
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>

          {/* Image */}
          <Skeleton className="aspect-video w-full mb-8 rounded-xl" />

          {/* Stats */}
          <Card className="mb-8 border border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse divide-border">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center justify-center py-6 px-4">
                    <Skeleton className="h-8 w-8 rounded-full mb-2" />
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-accent/50">
                  <Skeleton className="w-8 h-8 rounded-full flex-none" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mb-8">
            <Skeleton className="h-8 w-20 mb-6" />
            <div className="bg-accent/50 p-6 rounded-xl">
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="w-2 h-2 rounded-full mt-2 flex-none" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-card p-6 rounded-xl sticky top-24 border border-border/40 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Separator className="mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-2 py-2">
                  <Skeleton className="h-4 w-12 flex-none" />
                  <Skeleton className="h-4 flex-grow" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
