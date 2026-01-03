"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Search, Plus } from "lucide-react"
import type { Category } from "@/lib/types"

interface AdvancedSearchProps {
  categories: Category[]
  onClose?: () => void
}

interface SearchFilters {
  query: string
  category: string
  difficulty: string
  prepTimeMin: string
  prepTimeMax: string
  servingsMin: string
  servingsMax: string
  ingredients: string[]
  excludeIngredients: string[]
}

export function AdvancedSearch({ categories, onClose }: AdvancedSearchProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    difficulty: "",
    prepTimeMin: "",
    prepTimeMax: "",
    servingsMin: "",
    servingsMax: "",
    ingredients: [],
    excludeIngredients: [],
  })
  const [newIngredient, setNewIngredient] = useState("")
  const [newExcludeIngredient, setNewExcludeIngredient] = useState("")

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const addIngredient = (ingredient: string, type: "include" | "exclude") => {
    if (!ingredient.trim()) return

    const key = type === "include" ? "ingredients" : "excludeIngredients"
    setFilters((prev) => ({
      ...prev,
      [key]: [...prev[key], ingredient.trim()],
    }))

    if (type === "include") {
      setNewIngredient("")
    } else {
      setNewExcludeIngredient("")
    }
  }

  const removeIngredient = (ingredient: string, type: "include" | "exclude") => {
    const key = type === "include" ? "ingredients" : "excludeIngredients"
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item !== ingredient),
    }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams()

    // Build search query
    const searchParts: string[] = []

    if (filters.query) {
      searchParts.push(filters.query)
    }

    if (filters.ingredients.length > 0) {
      searchParts.push(...filters.ingredients)
    }

    if (searchParts.length > 0) {
      params.set("search", searchParts.join(" "))
    }

    if (filters.category) {
      params.set("category", filters.category)
    }

    if (filters.difficulty) {
      params.set("difficulty", filters.difficulty)
    }

    if (filters.prepTimeMin) {
      params.set("prepTimeMin", filters.prepTimeMin)
    }

    if (filters.prepTimeMax) {
      params.set("prepTimeMax", filters.prepTimeMax)
    }

    if (filters.servingsMin) {
      params.set("servingsMin", filters.servingsMin)
    }

    if (filters.servingsMax) {
      params.set("servingsMax", filters.servingsMax)
    }

    if (filters.excludeIngredients.length > 0) {
      params.set("exclude", filters.excludeIngredients.join(","))
    }

    router.push(`/?${params.toString()}`)
    onClose?.()
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      difficulty: "",
      prepTimeMin: "",
      prepTimeMax: "",
      servingsMin: "",
      servingsMax: "",
      ingredients: [],
      excludeIngredients: [],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>חיפוש מתקדם</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Search */}
          <div className="space-y-2">
            <Label htmlFor="query">חיפוש כללי</Label>
            <Input
              id="query"
              placeholder="שם מתכון, תיאור..."
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>

          <Separator />

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>רמת קושי</Label>
              <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר רמת קושי" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הרמות</SelectItem>
                  <SelectItem value="easy">קל</SelectItem>
                  <SelectItem value="medium">בינוני</SelectItem>
                  <SelectItem value="hard">מורכב</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <Label>זמן הכנה (דקות)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="מינימום"
                type="number"
                value={filters.prepTimeMin}
                onChange={(e) => handleFilterChange("prepTimeMin", e.target.value)}
              />
              <Input
                placeholder="מקסימום"
                type="number"
                value={filters.prepTimeMax}
                onChange={(e) => handleFilterChange("prepTimeMax", e.target.value)}
              />
            </div>
          </div>

          {/* Servings Range */}
          <div className="space-y-2">
            <Label>מספר מנות</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="מינימום"
                type="number"
                value={filters.servingsMin}
                onChange={(e) => handleFilterChange("servingsMin", e.target.value)}
              />
              <Input
                placeholder="מקסימום"
                type="number"
                value={filters.servingsMax}
                onChange={(e) => handleFilterChange("servingsMax", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Include Ingredients */}
          <div className="space-y-3">
            <Label>מרכיבים שחייבים להיות במתכון</Label>
            <div className="flex gap-2">
              <Input
                placeholder="הוסף מרכיב..."
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addIngredient(newIngredient, "include")
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addIngredient(newIngredient, "include")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {filters.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeIngredient(ingredient, "include")}
                  >
                    {ingredient}
                    <X className="h-3 w-3 mr-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Exclude Ingredients */}
          <div className="space-y-3">
            <Label>מרכיבים שלא צריכים להיות במתכון</Label>
            <div className="flex gap-2">
              <Input
                placeholder="הוסף מרכיב לא רצוי..."
                value={newExcludeIngredient}
                onChange={(e) => setNewExcludeIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addIngredient(newExcludeIngredient, "exclude")
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addIngredient(newExcludeIngredient, "exclude")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {filters.excludeIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.excludeIngredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => removeIngredient(ingredient, "exclude")}
                  >
                    {ingredient}
                    <X className="h-3 w-3 mr-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              חפש מתכונים
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              נקה הכל
            </Button>
            <Button variant="ghost" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
