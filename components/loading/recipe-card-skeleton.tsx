import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function RecipeCardSkeleton() {
  return (
    <Card className="recipe-card h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between mt-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardFooter>
    </Card>
  )
}
