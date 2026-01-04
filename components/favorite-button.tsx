"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleFavorite, isFavorite } from "@/app/actions/recipes"
import { useToast } from "@/components/ui/use-toast"

interface FavoriteButtonProps {
  recipeId: string
}

export function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // מפתח ל-localStorage
  const localStorageKey = `favorite-${recipeId}`

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // בדיקה אם המתכון במועדפים ב-localStorage
        const isLocalFavorite = localStorage.getItem(localStorageKey) === "true"

        // בדיקה אם המתכון במועדפים בשרת (אם יש משתמש מזוהה)
        // כרגע אין לנו מערכת משתמשים, אז נעביר null
        const isServerFavorite = await isFavorite(recipeId, null)

        // המתכון במועדפים אם הוא במועדפים ב-localStorage או בשרת
        setIsFav(isLocalFavorite || isServerFavorite)
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkFavoriteStatus()
  }, [recipeId, localStorageKey])

  const handleToggleFavorite = async () => {
    try {
      setIsLoading(true)

      // כרגע אין לנו מערכת משתמשים, אז נעביר null
      const result = await toggleFavorite(recipeId, null)

      if (result.success) {
        // אם זה רק בצד הלקוח, נשמור ב-localStorage
        if (result.clientSideOnly) {
          const newStatus = !isFav
          localStorage.setItem(localStorageKey, newStatus.toString())
          setIsFav(newStatus)
        } else {
          setIsFav(result.isFavorite)
        }

        toast({
          title: isFav ? "הוסר מהמועדפים" : "נוסף למועדפים",
          description: isFav ? "המתכון הוסר מרשימת המועדפים שלך" : "המתכון נוסף לרשימת המועדפים שלך",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון המועדפים",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`transition-colors bg-background/80 backdrop-blur-sm hover:bg-background/90 ${isFav ? "text-red-500 hover:text-red-600" : ""}`}
    >
      <Heart className={`h-5 w-5 transition-all ${isFav ? "fill-current scale-110" : ""}`} />
      <span className="sr-only">{isFav ? "הסר מהמועדפים" : "הוסף למועדפים"}</span>
    </Button>
  )
}
