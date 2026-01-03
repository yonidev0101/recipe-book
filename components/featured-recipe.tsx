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
      className="relative overflow-hidden rounded-xl bg-card shadow-lg border border-border/40 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="font-medium shadow-sm">
          מתכון מומלץ
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative h-64 md:h-auto">
          <OptimizedImage
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            cloudinaryType="hero"
            fill
            className="w-full md:h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:hidden">
            <h2 className="text-2xl font-bold mb-2 text-shadow">{recipe.title}</h2>
            <p className="line-clamp-2 text-white/90 text-shadow-sm mb-4">{recipe.description}</p>
          </div>
        </div>

        <div className="p-6 md:py-8 flex flex-col">
          <div className="hidden md:block mb-4">
            <h2 className="text-3xl font-bold mb-3 gradient-heading">{recipe.title}</h2>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex flex-col items-center justify-center p-3 bg-accent rounded-lg">
              <Clock className="h-5 w-5 text-primary mb-1" />
              <span className="text-sm text-muted-foreground">זמן הכנה</span>
              <span className="font-medium">{recipe.prepTime} דקות</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-accent rounded-lg">
              <Users className="h-5 w-5 text-primary mb-1" />
              <span className="text-sm text-muted-foreground">מנות</span>
              <span className="font-medium">{recipe.servings}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-accent rounded-lg">
              <ChefHat className="h-5 w-5 text-primary mb-1" />
              <span className="text-sm text-muted-foreground">רמת קושי</span>
              <span className="font-medium">{recipe.difficulty}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline" className="bg-secondary">
              {recipe.category}
            </Badge>
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="bg-secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between">
            <Button asChild size="lg">
              <Link href={`/recipes/${recipe.id}`}>צפה במתכון</Link>
            </Button>
            <FavoriteButton recipeId={recipe.id} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
