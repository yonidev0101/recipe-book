"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import type { Category } from "@/lib/types"

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value === "all") {
      params.delete("category")
    } else {
      params.set("category", value)
    }

    // שמירה על פרמטר החיפוש אם קיים
    router.push(`/?${params.toString()}`)
  }

  return (
    <motion.div
      className="overflow-x-auto pb-2 -mx-6 px-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex space-x-2 rtl:space-x-reverse min-w-max">
        <button
          key="all"
          onClick={() => handleCategoryChange("all")}
          className={`category-pill ${activeCategory === "all" ? "category-pill-active" : "category-pill-inactive"}`}
        >
          הכל
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`category-pill ${
              activeCategory === category.id ? "category-pill-active" : "category-pill-inactive"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
