"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, ChefHat, Printer, Share2, Edit, Trash2, Info } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"
import { LoadingSpinner } from "@/components/loading/loading-spinner"
import { OptimizedImage } from "@/components/optimized-image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteRecipe } from "@/app/actions/recipes"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { parseIngredient, adjustAllIngredients } from "@/lib/recipe-utils"
import type { Recipe } from "@/lib/types"

interface RecipeDetailProps {
  recipe: Recipe
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings)
  const [adjustedIngredients, setAdjustedIngredients] = useState<string[]>(recipe.ingredients)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // פונקציה לעדכון כמויות המרכיבים בהתאם למספר המנות
  const updateIngredientQuantities = (newServings: number) => {
    const adjusted = adjustAllIngredients(recipe.ingredients, recipe.servings, newServings)
    setAdjustedIngredients(adjusted)
    setServings(newServings)
  }

  // פונקציה להגדלת מספר המנות
  const increaseServings = () => {
    const newServings = servings + 1
    updateIngredientQuantities(newServings)
  }

  // פונקציה להקטנת מספר המנות
  const decreaseServings = () => {
    if (servings > 1) {
      const newServings = servings - 1
      updateIngredientQuantities(newServings)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteRecipe(recipe.id)

      if (result.success) {
        toast({
          title: "המתכון נמחק בהצלחה",
          description: "המתכון הוסר מספר המתכונים שלך",
        })
        router.push("/")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת מחיקת המתכון",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      const url = window.location.href

      if (navigator.share) {
        await navigator.share({
          title: recipe.title,
          text: recipe.description || `מתכון ל${recipe.title}`,
          url: url,
        })
        toast({
          title: "המתכון שותף בהצלחה",
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast({
          title: "הקישור הועתק ללוח",
          description: "כעת תוכל להדביק ולשתף את המתכון",
        })
      }
    } catch (error) {
      console.error("Error sharing recipe:", error)
      toast({
        title: "שגיאה בשיתוף המתכון",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="container py-8">
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="lg:col-span-2" variants={item}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 gradient-heading">{recipe.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm font-medium shadow-sm">
                  {recipe.category}
                </Badge>
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm shadow-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <FavoriteButton recipeId={recipe.id} />
              <Button variant="outline" size="icon" className="rounded-full hover:bg-accent">
                <Printer className="h-4 w-4" />
                <span className="sr-only">הדפס</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:bg-accent"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? <LoadingSpinner size="sm" /> : <Share2 className="h-4 w-4" />}
                <span className="sr-only">שתף</span>
              </Button>
              <Button variant="outline" size="icon" asChild className="rounded-full hover:bg-accent">
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">ערוך</span>
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                    <span className="sr-only">מחק</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את המתכון?</AlertDialogTitle>
                    <AlertDialogDescription>
                      פעולה זו אינה ניתנת לביטול. המתכון יימחק לצמיתות מספר המתכונים שלך.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          מוחק...
                        </>
                      ) : (
                        "מחק"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <motion.div className="mb-8" variants={item}>
            <OptimizedImage
              src={recipe.image || "/placeholder.svg"}
              alt={recipe.title}
              cloudinaryType="detail"
              aspectRatio="video"
              className="w-full rounded-xl shadow-lg"
              priority
            />
          </motion.div>

          <motion.div variants={item}>
            <Card className="mb-8 border border-border/40 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse divide-border">
                  <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-accent/50 to-accent/10">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">זמן הכנה</p>
                    <p className="font-medium text-lg">{recipe.prepTime} דקות</p>
                  </div>
                  <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-accent/50 to-accent/10">
                    <ChefHat className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">רמת קושי</p>
                    <p className="font-medium text-lg">{recipe.difficulty}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-accent/50 to-accent/10">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">מספר מנות</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={decreaseServings}
                        disabled={servings <= 1}
                      >
                        <span>-</span>
                      </Button>
                      <span className="font-medium w-6 text-center text-lg">{servings}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={increaseServings}>
                        <span>+</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="mb-8" variants={item}>
            <h2 className="text-2xl font-bold mb-6 gradient-heading flex items-center text-foreground">
              <span className="relative">
                אופן ההכנה
                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/30 rounded-full"></span>
              </span>
            </h2>
            <ol className="space-y-6 list-none">
              {recipe.instructions.map((step, index) => (
                <motion.li
                  key={index}
                  className="recipe-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="recipe-step-number">{index + 1}</div>
                  <span className="text-base">{step}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>

          {recipe.tips.length > 0 && (
            <motion.div className="mb-8" variants={item}>
              <h2 className="text-2xl font-bold mb-6 gradient-heading flex items-center text-foreground">
                <span className="relative">
                  טיפים
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/30 rounded-full"></span>
                </span>
              </h2>
              <div className="bg-accent/50 p-6 rounded-xl shadow-sm border border-border/40">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-none mt-1">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground">טיפים והערות שיעזרו לך להצליח במתכון:</p>
                </div>
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-2 pb-3 border-b border-border/30 last:border-0 last:pb-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <span className="text-primary font-bold">•</span>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-card p-6 rounded-xl sticky top-24 border border-border/40 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold gradient-heading flex items-center text-foreground">
                <span className="relative">
                  מרכיבים
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/30 rounded-full"></span>
                </span>
              </h2>
              {servings !== recipe.servings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateIngredientQuantities(recipe.servings)}
                  className="text-xs rounded-full"
                >
                  איפוס ({recipe.servings} מנות)
                </Button>
              )}
            </div>
            <Separator className="mb-4" />
            <ul className="space-y-2">
              {adjustedIngredients.map((ingredient, index) => {
                const parsedIngredient = parseIngredient(ingredient)

                return (
                  <motion.li
                    key={index}
                    className="recipe-ingredient"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    {parsedIngredient.hasQuantity ? (
                      <div className="flex gap-1">
                        <span className="recipe-ingredient-quantity">{ingredient.split(" ")[0]}</span>
                        <span>{ingredient.substring(ingredient.indexOf(" ") + 1)}</span>
                      </div>
                    ) : (
                      <span>{ingredient}</span>
                    )}
                  </motion.li>
                )
              })}
            </ul>

            <div className="mt-8 p-4 bg-accent/50 rounded-lg border border-border/40">
              <p className="text-sm text-muted-foreground">* ניתן לשנות את כמות המנות בעזרת הכפתורים למעלה</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
