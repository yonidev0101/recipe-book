"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Utensils } from "lucide-react"
import { createCategory } from "@/app/actions/recipes"
import { useToast } from "@/components/ui/use-toast"
import type { Category } from "@/lib/types"

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "שגיאה",
        description: "שם הקטגוריה לא יכול להיות ריק",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      const result = await createCategory(newCategoryName)

      if (result) {
        toast({
          title: "הקטגוריה נוצרה בהצלחה",
          description: `הקטגוריה "${newCategoryName}" נוספה בהצלחה`,
        })
        setNewCategoryName("")
        // רענון הדף כדי להציג את הקטגוריה החדשה
        window.location.reload()
      } else {
        throw new Error("שגיאה ביצירת הקטגוריה")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת הקטגוריה",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div>
      <motion.div
        className="bg-card p-6 rounded-xl border border-border/40 shadow-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="חפש קטגוריה..."
              className="pr-9 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="שם קטגוריה חדשה"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="rounded-full"
            />
            <Button onClick={handleCreateCategory} disabled={isCreating} className="rounded-full">
              {isCreating ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  יוצר...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  צור קטגוריה
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {filteredCategories.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredCategories.map((category, index) => (
            <motion.div key={category.id} variants={item}>
              <Link href={`/?category=${category.id}`}>
                <Card className="recipe-card h-full group">
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">לחץ לצפייה</span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription>לחץ כדי לצפות במתכונים בקטגוריה זו</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12 bg-accent/30 rounded-xl border border-border/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-medium mb-2">לא נמצאו קטגוריות</h3>
          <p className="text-muted-foreground mb-4">נסה לחפש מונח אחר או ליצור קטגוריה חדשה</p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-full">
              הצג את כל הקטגוריות
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}
