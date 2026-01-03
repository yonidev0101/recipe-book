import { Suspense } from "react"
import { getRecipes, getCategories } from "@/app/actions/recipes"
import { RecipeList } from "@/components/recipe-list"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { HeroSection } from "@/components/hero-section"
import { FeaturedRecipe } from "@/components/featured-recipe"
import { RecipeCardSkeleton } from "@/components/loading/recipe-card-skeleton"
import { SearchResults } from "@/components/search-results"

interface HomePageProps {
  searchParams: Promise<{
    category?: string
    search?: string
  }>
}

async function RecipesContent({ searchParams }: HomePageProps) {
  const { category, search } = await searchParams

  // קבלת כל הקטגוריות
  const categories = await getCategories()

  // קבלת המתכונים עם סינון לפי קטגוריה וחיפוש
  const recipes = await getRecipes(category, search)

  // בחירת מתכון מומלץ (הראשון ברשימה או אקראי)
  const featuredRecipe = recipes.length > 0 && !search && !category ? recipes[0] : null

  // שאר המתכונים (ללא המתכון המומלץ)
  const otherRecipes = featuredRecipe ? recipes.slice(1) : recipes

  return (
    <>
      {/* הצג את ה-Hero Section רק בדף הבית ללא חיפוש או סינון */}
      {!search && !category && <HeroSection />}

      {/* כותרת ותיבת חיפוש */}
      <section className="mb-6" data-recipes-section>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            {search ? `תוצאות חיפוש: "${search}"` : category ? `מתכונים בקטגוריה` : "המתכונים שלי"}
          </h1>
          <SearchBar defaultValue={search} />
        </div>

        {/* סינון לפי קטגוריות */}
        <div className="mb-6">
          <CategoryFilter categories={categories} activeCategory={category || "all"} />
        </div>

        {/* מתכון מומלץ */}
        {featuredRecipe && (
          <div className="mb-8">
            <FeaturedRecipe recipe={featuredRecipe} />
          </div>
        )}

        {/* תוצאות חיפוש או רשימת המתכונים */}
        {search ? <SearchResults recipes={otherRecipes} searchQuery={search} /> : <RecipeList recipes={otherRecipes} />}
      </section>
    </>
  )
}

function RecipesSkeleton() {
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full md:w-80 bg-muted animate-pulse rounded-full" />
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 rtl:space-x-reverse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <Suspense fallback={<RecipesSkeleton />}>
        <RecipesContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
