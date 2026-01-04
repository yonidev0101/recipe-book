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
      <Card className="recipe-card h-full flex flex-col group overflow-hidden !p-0 !gap-0">
        <Link href={`/recipes/${recipe.id}`} className="recipe-image relative block aspect-[4/3] overflow-hidden">
          <OptimizedImage
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            cloudinaryType="card"
            cloudinarySize="medium"
            fill
            className="w-full"
            priority={index < 3}
          />
          <div className="absolute top-2.5 right-2.5 z-10">
            <Badge className="recipe-badge text-xs">
              {recipe.category}
            </Badge>
          </div>
          <div className="absolute top-2.5 left-2.5 z-10">
            <FavoriteButton recipeId={recipe.id} />
          </div>
        </Link>

        <div className="flex flex-col flex-grow p-3 pt-2.5">
          <Link href={`/recipes/${recipe.id}`} className="block mb-1">
            <h3 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {recipe.title}
            </h3>
          </Link>

          {recipe.description && (
            <p className="text-muted-foreground text-xs line-clamp-2 leading-snug mb-1.5">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto mb-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              <span>{recipe.prepTime} דק׳</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              <span>{recipe.servings} מנות</span>
            </div>
          </div>

          <Button asChild variant="default" size="sm" className="w-full h-8 text-sm">
            <Link href={`/recipes/${recipe.id}`}>צפה במתכון</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
