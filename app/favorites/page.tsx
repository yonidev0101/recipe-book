"use client"

import { useState, useEffect } from "react"
import { RecipeList } from "@/components/recipe-list"
import { getRecipes } from "@/app/actions/recipes"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { RecipeCardSkeleton } from "@/components/loading/recipe-card-skeleton"
import type { Recipe } from "@/lib/types"

function FavoritesSkeleton() {
  return (
    <div className="container py-8">
      <div className="hero-section mb-12">
        <div className="hero-pattern" />
        <div className="relative z-10 flex items-center gap-4">
          <Heart className="h-12 w-12 text-white" />
          <div>
            <div className="h-10 w-80 bg-white/20 animate-pulse rounded mb-2" />
            <div className="h-6 w-96 bg-white/10 animate-pulse rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // קבלת כל המתכונים
        const allRecipes = await getRecipes()

        // סינון רק המתכונים שמסומנים כמועדפים ב-localStorage
        const favoriteRecipes = allRecipes.filter((recipe) => {
          const localStorageKey = `favorite-${recipe.id}`
          return localStorage.getItem(localStorageKey) === "true"
        })

        setRecipes(favoriteRecipes)
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  if (loading) {
    return <FavoritesSkeleton />
  }

  return (
    <div className="container py-8">
      <motion.div
        className="hero-section mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-pattern" />
        <div className="relative z-10 flex items-center gap-4">
          <Heart className="h-12 w-12 text-white" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-shadow-lg">המתכונים המועדפים שלי</h1>
            <p className="text-white/90 text-shadow-sm">כל המתכונים שסימנת כמועדפים במקום אחד</p>
          </div>
        </div>
      </motion.div>

      <RecipeList recipes={recipes} />

      {recipes.length === 0 && (
        <motion.div
          className="text-center py-16 bg-accent/30 rounded-xl border border-border/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">אין לך מתכונים מועדפים עדיין</h3>
          <p className="text-muted-foreground mb-4">סמן מתכונים כמועדפים על ידי לחיצה על סמל הלב בכרטיס המתכון</p>
        </motion.div>
      )}
    </div>
  )
}
