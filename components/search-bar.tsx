"use client"

import type React from "react"
import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, X, Clock, TrendingUp, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading/loading-spinner"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { AdvancedSearch } from "@/components/advanced-search"
import { getCategories } from "@/app/actions/recipes"
import type { Category } from "@/lib/types"

interface SearchBarProps {
  defaultValue?: string
}

interface SearchSuggestion {
  text: string
  type: "recipe" | "ingredient" | "category" | "tag"
  count?: number
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>("search-history", [])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Popular searches - can be fetched from analytics
  const popularSearches = ["עוגת שוקולד", "חומוס", "סלט", "פסטה", "עוף"]

  // Load categories for advanced search
  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        generateSuggestions(searchQuery)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const generateSuggestions = async (query: string) => {
    const suggestions: SearchSuggestion[] = []
    const lowerQuery = query.toLowerCase()

    // Add matching popular searches
    popularSearches
      .filter((search) => search.toLowerCase().includes(lowerQuery))
      .forEach((search) => {
        suggestions.push({
          text: search,
          type: "recipe",
          count: Math.floor(Math.random() * 20) + 1,
        })
      })

    // Add matching search history
    searchHistory
      .filter((search) => search.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach((search) => {
        if (!suggestions.find((s) => s.text === search)) {
          suggestions.push({
            text: search,
            type: "recipe",
          })
        }
      })

    // Add ingredient suggestions
    const ingredientSuggestions = [
      "קמח",
      "סוכר",
      "ביצים",
      "חלב",
      "שמן",
      "שום",
      "בצל",
      "עגבניות",
      "מלפפון",
      "גזר",
    ].filter((ingredient) => ingredient.toLowerCase().includes(lowerQuery))

    ingredientSuggestions.forEach((ingredient) => {
      suggestions.push({
        text: ingredient,
        type: "ingredient",
      })
    })

    setSuggestions(suggestions.slice(0, 8))
  }

  const handleSearch = (query: string = searchQuery) => {
    if (!query.trim()) return

    const params = new URLSearchParams(searchParams)

    if (query) {
      params.set("search", query)
      // Add to search history
      const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 10)
      setSearchHistory(newHistory)
    } else {
      params.delete("search")
    }

    setShowSuggestions(false)
    startTransition(() => {
      router.push(`/?${params.toString()}`)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleClear = () => {
    setSearchQuery("")
    const params = new URLSearchParams(searchParams)
    params.delete("search")
    setShowSuggestions(false)
    startTransition(() => {
      router.push(`/?${params.toString()}`)
    })
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text)
    handleSearch(suggestion.text)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
    if (searchQuery.length >= 2) {
      generateSuggestions(searchQuery)
    }
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    setSuggestions([])
  }

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "ingredient":
        return "🥕"
      case "category":
        return "📂"
      case "tag":
        return "🏷️"
      default:
        return "🍽️"
    }
  }

  return (
    <div ref={searchRef} className="relative w-full md:w-auto md:min-w-[300px]">
      <motion.form
        onSubmit={handleSubmit}
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="חפש מתכונים, מרכיבים או קטגוריות..."
            className="pr-9 pl-28 sm:pl-36 text-base rounded-full border-input/80 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            disabled={isPending}
          />
          <div className="absolute left-1 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdvancedSearch(true)}
              title="חיפוש מתקדם"
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline mr-1 text-xs">מתקדם</span>
            </Button>
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" size="sm" className="h-7 rounded-full" disabled={isPending}>
              {isPending ? <LoadingSpinner size="sm" className="text-white" /> : "חפש"}
            </Button>
          </div>
        </div>
      </motion.form>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-lg border border-border/40">
              <CardContent className="p-0">
                {suggestions.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={`${suggestion.text}-${suggestion.type}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-right border-b border-border/30 last:border-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                        <div className="flex-grow text-right">
                          <div className="font-medium">{suggestion.text}</div>
                          {suggestion.count && (
                            <div className="text-xs text-muted-foreground">{suggestion.count} מתכונים</div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type === "ingredient" && "מרכיב"}
                          {suggestion.type === "category" && "קטגוריה"}
                          {suggestion.type === "tag" && "תג"}
                          {suggestion.type === "recipe" && "מתכון"}
                        </Badge>
                      </motion.button>
                    ))}
                  </div>
                ) : searchQuery.length === 0 ? (
                  <div className="p-4">
                    {/* Popular Searches */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">חיפושים פופולריים</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.slice(0, 6).map((search) => (
                          <Button
                            key={search}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => handleSuggestionClick({ text: search, type: "recipe" })}
                          >
                            {search}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Search History */}
                    {searchHistory.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">חיפושים אחרונים</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-muted-foreground hover:text-foreground"
                            onClick={clearSearchHistory}
                          >
                            נקה
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {searchHistory.slice(0, 5).map((search, index) => (
                            <button
                              key={index}
                              className="w-full flex items-center gap-3 px-2 py-2 hover:bg-accent rounded-md transition-colors text-right"
                              onClick={() => handleSuggestionClick({ text: search, type: "recipe" })}
                            >
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">לא נמצאו הצעות לחיפוש "{searchQuery}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && <AdvancedSearch categories={categories} onClose={() => setShowAdvancedSearch(false)} />}
    </div>
  )
}
