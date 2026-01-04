"use client"

import { useState } from "react"
import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading/loading-spinner"
import { motion } from "framer-motion"
import type { Recipe } from "@/lib/types"

interface RecipeListProps {
  recipes: Recipe[]
}

export function RecipeList({ recipes }: RecipeListProps) {
  const [visibleCount, setVisibleCount] = useState(6)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  if (recipes.length === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-accent/30 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="text-xl font-medium mb-2">לא נמצאו מתכונים</h3>
        <p className="text-muted-foreground mb-4">נסה לחפש מונח אחר או לבחור קטגוריה שונה</p>
        <Button asChild>
          <a href="/">הצג את כל המתכונים</a>
        </Button>
      </motion.div>
    )
  }

  const visibleRecipes = recipes.slice(0, visibleCount)
  const hasMore = visibleCount < recipes.length

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    // סימולציה של טעינה
    await new Promise((resolve) => setTimeout(resolve, 500))
    setVisibleCount((prev) => prev + 6)
    setIsLoadingMore(false)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleRecipes.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                טוען עוד מתכונים...
              </>
            ) : (
              "טען עוד מתכונים"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
