"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Clock, Users, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FavoriteButton } from "@/components/favorite-button"
import { OptimizedImage } from "@/components/optimized-image"
import type { Recipe } from "@/lib/types"

interface FeaturedRecipeProps {
  recipe: Recipe
}

export function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl bg-card shadow-md border border-border/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-3 right-3 z-10">
        <Badge variant="secondary" className="text-xs font-medium shadow-sm">
          מתכון מומלץ
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Image Section - 40% on desktop */}
        <div className="relative h-48 md:h-auto md:w-2/5 flex-shrink-0">
          <OptimizedImage
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            cloudinaryType="hero"
            fill
            className="w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Content Section - 60% on desktop */}
        <div className="p-4 md:p-5 md:w-3/5 flex flex-col">
          <div className="mb-3">
            <h2 className="text-xl md:text-2xl font-bold mb-2">{recipe.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
          </div>

          {/* Stats - Inline Flex */}
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{recipe.prepTime} דקות</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{recipe.servings} מנות</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <ChefHat className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{recipe.difficulty}</span>
            </div>
          </div>

          {/* Tags - Max 2 tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs bg-secondary">
              {recipe.category}
            </Badge>
            {recipe.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex items-center gap-3">
            <Button asChild>
              <Link href={`/recipes/${recipe.id}`}>צפה במתכון</Link>
            </Button>
            <FavoriteButton recipeId={recipe.id} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
