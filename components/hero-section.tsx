"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Sliders } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdvancedSearch } from "@/components/advanced-search"
import { getCategories } from "@/app/actions/recipes"
import type { Category } from "@/lib/types"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [randomPlaceholder, setRandomPlaceholder] = useState("")
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()

  const placeholders = ["עוגת שוקולד...", "חומוס ביתי...", "סלט ירקות...", "לחם ביתי...", "עוגיות...", "פסטה..."]

  useEffect(() => {
    setRandomPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)])

    // Load categories for advanced search
    getCategories().then(setCategories)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const popularSearches = ["עוגות", "ארוחת ערב", "סלטים", "מרקים", "קינוחים"]

  return (
    <>
      <div className="hero-section mb-12">
        <div className="hero-pattern" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ספר המתכונים שלך
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 text-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            גלה, שמור ובשל את המתכונים האהובים עליך בקלות
          </motion.p>

          <motion.form
            onSubmit={handleSearch}
            className="relative max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`חפש מתכון... ${randomPlaceholder}`}
                className="pr-10 pl-32 sm:pl-40 py-5 sm:py-6 text-base bg-white/95 backdrop-blur-sm border-white/20 shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAdvancedSearch(true)}
                >
                  <Sliders className="h-4 w-4" />
                  <span className="hidden sm:inline mr-1">מתקדם</span>
                </Button>
                <Button type="submit" size="sm" className="h-7 rounded-full">
                  חפש
                </Button>
              </div>
            </div>
          </motion.form>

          <motion.div
            className="flex flex-col items-center justify-center mt-5 sm:mt-6 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="text-white/80 text-xs sm:text-sm mb-2">חיפושים פופולריים:</span>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {popularSearches.map((term) => (
                <Button
                  key={term}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                  onClick={() => router.push(`/?search=${encodeURIComponent(term)}`)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && <AdvancedSearch categories={categories} onClose={() => setShowAdvancedSearch(false)} />}
    </>
  )
}
