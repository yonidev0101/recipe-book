import { RecipeFormRedesigned } from "@/components/recipe-form-redesigned"
import { getCategories } from "@/app/actions/recipes"

export default async function NewRecipePage() {
  const categories = await getCategories()

  return (
    <div className="container py-8">
      <RecipeFormRedesigned categories={categories} />
    </div>
  )
}
