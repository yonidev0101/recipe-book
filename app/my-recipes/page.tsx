import { getMyRecipes } from "@/app/actions/recipes"
import { getCurrentUser } from "@/lib/supabase/server"
import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/ui/button"
import { Plus, ChefHat } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "המתכונים שלי",
  description: "צפה ונהל את המתכונים שיצרת",
}

export default async function MyRecipesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const recipes = await getMyRecipes()

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">המתכונים שלי</h1>
        </div>
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="h-4 w-4 ml-2" />
            מתכון חדש
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-accent/30 rounded-xl">
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">עדיין לא יצרת מתכונים</h3>
          <p className="text-muted-foreground mb-6">
            התחל ליצור את אוסף המתכונים שלך עכשיו!
          </p>
          <Button asChild>
            <Link href="/recipes/new">
              <Plus className="h-4 w-4 ml-2" />
              צור מתכון ראשון
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map((recipe, index) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
