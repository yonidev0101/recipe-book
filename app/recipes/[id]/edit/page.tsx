import { getRecipeById, getCategories } from "@/app/actions/recipes"
import { RecipeFormRedesigned } from "@/components/recipe-form-redesigned"
import { notFound } from "next/navigation"

interface EditRecipePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params
  const [recipe, categories] = await Promise.all([getRecipeById(id), getCategories()])

  if (!recipe) {
    notFound()
  }

  return (
    <div className="container py-8">
      <RecipeFormRedesigned categories={categories} recipe={recipe} isEditing={true} />
    </div>
  )
}
