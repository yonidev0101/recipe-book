"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Edit3, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { RecipeFormRedesigned } from "@/components/recipe-form-redesigned"
import { createRecipe } from "@/app/actions/recipes"
import type { ParsedRecipe } from "@/lib/ai-recipe-import/schema"
import type { Category, Recipe, RecipeFormData } from "@/lib/types"

interface RecipePreviewEditorProps {
  parsedRecipe: ParsedRecipe
  categories: Category[]
  imageUrl?: string | null
  onBack: () => void
  onSuccess: () => void
}

export function RecipePreviewEditor({ parsedRecipe, categories, imageUrl, onBack, onSuccess }: RecipePreviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // התאמת קטגוריה
  const matchedCategory = categories.find(
    (cat) =>
      cat.name.trim().toLowerCase() === parsedRecipe.categoryName.trim().toLowerCase() ||
      cat.name.includes(parsedRecipe.categoryName) ||
      parsedRecipe.categoryName.includes(cat.name)
  )

  const categoryId = matchedCategory?.id || categories[0]?.id || ""

  // המרה ל-Recipe object לצורך תצוגה בטופס
  const recipeForPreview: Recipe = {
    id: "temp-id",
    title: parsedRecipe.title,
    description: parsedRecipe.description,
    category: matchedCategory?.name || categories[0]?.name || "",
    categoryId: categoryId,
    tags: [],
    prepTime: parsedRecipe.prepTime,
    servings: parsedRecipe.servings,
    difficulty: parsedRecipe.difficulty,
    ingredients: parsedRecipe.ingredients,
    instructions: parsedRecipe.instructions,
    tips: parsedRecipe.tips || [],
    image: imageUrl || "/placeholder.svg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const handleQuickSave = async () => {
    setIsSaving(true)

    try {
      const formData: RecipeFormData = {
        title: parsedRecipe.title,
        description: parsedRecipe.description,
        categoryId: categoryId,
        prepTime: parsedRecipe.prepTime,
        servings: parsedRecipe.servings,
        difficulty: parsedRecipe.difficulty,
        ingredients: parsedRecipe.ingredients,
        instructions: parsedRecipe.instructions,
        tips: parsedRecipe.tips || [],
        image: imageUrl,
      }

      const result = await createRecipe(formData)

      if (result.success) {
        toast({
          title: "המתכון נשמר בהצלחה! ✅",
          description: "המתכון התווסף לאוסף שלך",
        })
        router.push("/")
        onSuccess()
      } else {
        toast({
          title: "שגיאה בשמירת המתכון",
          description: "נסה שוב או ערוך את הפרטים ידנית",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast({
        title: "שגיאה בשמירת המתכון",
        description: "אירעה שגיאה לא צפויה. נסה שוב",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          {/* כותרת */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="font-medium">
                  מתכון מפוענח
                </Badge>
              </div>
              <h2 className="text-2xl font-bold">{parsedRecipe.title}</h2>
              <p className="text-muted-foreground mt-1">{parsedRecipe.description}</p>
            </div>
          </div>

          {/* פרטים כלליים */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">פרטי המתכון</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">קטגוריה</p>
                <p className="font-medium">{matchedCategory?.name || parsedRecipe.categoryName}</p>
                {!matchedCategory && (
                  <p className="text-xs text-orange-600">לא נמצאה התאמה - ישתמש בברירת מחדל</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">זמן הכנה</p>
                <p className="font-medium">{parsedRecipe.prepTime} דקות</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">מספר מנות</p>
                <p className="font-medium">{parsedRecipe.servings}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">רמת קושי</p>
                <p className="font-medium">{parsedRecipe.difficulty}</p>
              </div>
            </CardContent>
          </Card>

          {/* מרכיבים */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">מרכיבים ({parsedRecipe.ingredients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {parsedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* הוראות */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">הוראות הכנה ({parsedRecipe.instructions.length} שלבים)</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {parsedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* טיפים */}
          {parsedRecipe.tips && parsedRecipe.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">טיפים ({parsedRecipe.tips.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {parsedRecipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* כפתורי פעולה */}
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="gap-2" disabled={isSaving}>
              <ArrowLeft className="h-4 w-4" />
              חזור לעריכה
            </Button>
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2" disabled={isSaving}>
              <Edit3 className="h-4 w-4" />
              ערוך פרטים
            </Button>
            <Button onClick={handleQuickSave} className="flex-1 gap-2" disabled={isSaving}>
              {isSaving ? (
                "שומר..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  שמור מתכון
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">עריכת המתכון</h3>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              ביטול
            </Button>
          </div>
          <RecipeFormRedesigned categories={categories} recipe={recipeForPreview} isEditing={false} />
        </div>
      )}
    </div>
  )
}
