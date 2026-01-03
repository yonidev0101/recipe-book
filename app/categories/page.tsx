import { Suspense } from "react"
import { getCategories } from "@/app/actions/recipes"
import { CategoryList } from "@/components/category-list"
import { CategoryCardSkeleton } from "@/components/loading/category-card-skeleton"
import { Grid3X3 } from "lucide-react"

async function CategoriesContent() {
  const categories = await getCategories()
  return <CategoryList categories={categories} />
}

function CategoriesSkeleton() {
  return (
    <div>
      <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 w-full md:w-80 bg-muted animate-pulse rounded-full" />
          <div className="flex gap-2">
            <div className="h-10 w-40 bg-muted animate-pulse rounded-full" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <div className="hero-section mb-12">
        <div className="hero-pattern" />
        <div className="relative z-10 flex items-center gap-4">
          <Grid3X3 className="h-12 w-12 text-white" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-shadow-lg">קטגוריות מתכונים</h1>
            <p className="text-white/90 text-shadow-sm">מצא מתכונים לפי קטגוריות או צור קטגוריות חדשות</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  )
}
