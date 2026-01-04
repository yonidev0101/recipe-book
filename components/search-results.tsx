"use client"

import { motion } from "framer-motion"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecipeCard } from "@/components/recipe-card"
import { useState } from "react"
import type { Recipe } from "@/lib/types"

interface SearchResultsProps {
  recipes: Recipe[]
  searchQuery: string
  totalResults?: number
}

type SortOption = "relevance" | "newest" | "oldest" | "prepTime" | "title"

export function SearchResults({ recipes, searchQuery, totalResults }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [showFilters, setShowFilters] = useState(false)

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.trim()})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // Sort recipes based on selected option
  const sortedRecipes = [...recipes].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "prepTime":
        return a.prepTime - b.prepTime
      case "title":
        return a.title.localeCompare(b.title, "he")
      case "relevance":
      default:
        // Simple relevance scoring based on title match
        const aScore = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1
        const bScore = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1
        return bScore - aScore
    }
  })

  // Get search statistics
  const getSearchStats = () => {
    const categories = new Set(recipes.map((r) => r.category))
    const avgPrepTime = recipes.reduce((sum, r) => sum + r.prepTime, 0) / recipes.length

    return {
      categories: categories.size,
      avgPrepTime: Math.round(avgPrepTime),
      quickRecipes: recipes.filter((r) => r.prepTime <= 30).length,
    }
  }

  const stats = getSearchStats()

  if (recipes.length === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-accent/30 rounded-xl border border-border/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">לא נמצאו תוצאות עבור "{searchQuery}"</h3>
        <p className="text-muted-foreground mb-6">נסה לחפש במילים אחרות או בדוק את האיות</p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>💡 טיפים לחיפוש טוב יותר:</p>
          <ul className="list-none space-y-1">
            <li>• נסה מילים כלליות יותר</li>
            <li>• חפש לפי מרכיבים עיקריים</li>
            <li>• השתמש בשמות קטגוריות</li>
          </ul>
        </div>

        <Button asChild className="mt-6">
          <a href="/">חזור לדף הבית</a>
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <motion.div
        className="bg-card p-6 rounded-xl border border-border/40 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">תוצאות חיפוש עבור "{highlightText(searchQuery, searchQuery)}"</h2>
            <p className="text-muted-foreground">
              נמצאו {recipes.length} מתכונים
              {totalResults && totalResults !== recipes.length && ` מתוך ${totalResults}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">רלוונטיות</SelectItem>
                <SelectItem value="newest">החדשים ביותר</SelectItem>
                <SelectItem value="oldest">הישנים ביותר</SelectItem>
                <SelectItem value="prepTime">זמן הכנה</SelectItem>
                <SelectItem value="title">שם המתכון</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Statistics */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/30">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {stats.categories} קטגוריות
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            זמן ממוצע: {stats.avgPrepTime} דקות
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {stats.quickRecipes} מתכונים מהירים
          </Badge>
        </div>
      </motion.div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div
          className="bg-card p-6 rounded-xl border border-border/40 shadow-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3 className="font-medium mb-4">סינון מתקדם</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">זמן הכנה</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="בחר זמן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">עד 30 דקות</SelectItem>
                  <SelectItem value="medium">30-60 דקות</SelectItem>
                  <SelectItem value="long">מעל 60 דקות</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">רמת קושי</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="בחר רמה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">קל</SelectItem>
                  <SelectItem value="medium">בינוני</SelectItem>
                  <SelectItem value="hard">מורכב</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">מספר מנות</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="בחר כמות" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">1-2 מנות</SelectItem>
                  <SelectItem value="medium">3-6 מנות</SelectItem>
                  <SelectItem value="large">7+ מנות</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedRecipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <RecipeCard recipe={recipe} index={index} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
