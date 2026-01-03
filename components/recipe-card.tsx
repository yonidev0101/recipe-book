"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorite-button"
import { OptimizedImage } from "@/components/optimized-image"
import type { Recipe } from "@/lib/types"

interface RecipeCardProps {
  recipe: Recipe
  index?: number
}

export function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="recipe-card h-full flex flex-col">
        <Link href={`/recipes/${recipe.id}`} className="recipe-image relative block aspect-video overflow-hidden">
          <OptimizedImage
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            cloudinaryType="card"
            cloudinarySize="medium"
            fill
            className="w-full"
            priority={index < 3} // Priority loading for first 3 images
          />
          <div className="absolute top-3 right-3 z-10">
            <Badge className="recipe-badge bg-white/90 backdrop-blur-sm text-foreground shadow-sm">
              {recipe.category}
            </Badge>
          </div>
        </Link>
        <CardContent className="p-4 flex-grow">
          <Link href={`/recipes/${recipe.id}`} className="block group">
            <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {recipe.title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2 h-10">{recipe.description}</p>

          <div className="flex items-center justify-between mt-4">
            <div className="recipe-stats">
              <Clock className="recipe-stats-icon" />
              <span>{recipe.prepTime} דקות</span>
            </div>
            <div className="recipe-stats">
              <Users className="recipe-stats-icon" />
              <span>{recipe.servings} מנות</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between mt-auto">
          <Button asChild variant="default" size="sm" className="text-sm">
            <Link href={`/recipes/${recipe.id}`}>צפה במתכון</Link>
          </Button>
          <FavoriteButton recipeId={recipe.id} />
        </CardFooter>
      </Card>
    </motion.div>
  )
}
