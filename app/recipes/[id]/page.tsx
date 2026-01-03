import { Suspense } from "react"
import { getRecipeById } from "@/app/actions/recipes"
import { RecipeDetail } from "@/components/recipe-detail"
import { RecipeDetailSkeleton } from "@/components/loading/recipe-detail-skeleton"
import { notFound } from "next/navigation"

interface RecipePageProps {
  params: Promise<{
    id: string
  }>
}

async function RecipeContent({ params }: RecipePageProps) {
  const { id } = await params
  const recipe = await getRecipeById(id)

  if (!recipe) {
    notFound()
  }

  return <RecipeDetail recipe={recipe} />
}

export default function RecipePage({ params }: RecipePageProps) {
  return (
    <Suspense fallback={<RecipeDetailSkeleton />}>
      <RecipeContent params={params} />
    </Suspense>
  )
}
