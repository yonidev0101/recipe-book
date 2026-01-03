"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createRecipe, updateRecipe, createCategory } from "@/app/actions/recipes"
import { useOffline } from "@/hooks/use-offline"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Save, ArrowLeft, Utensils, WifiOff, AlertTriangle } from "lucide-react"
import type { Category, Recipe } from "@/lib/types"

interface RecipeFormProps {
  categories: Category[]
  recipe?: Recipe
  isEditing?: boolean
}

export function RecipeFormOffline({ categories, recipe, isEditing = false }: RecipeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { isOnline, addOfflineAction } = useOffline()
  const ingredientInputRef = useRef<HTMLInputElement>(null)
  const instructionInputRef = useRef<HTMLTextAreaElement>(null)
  const tipInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // מפתח ייחודי לשמירה מקומית
  const storageKey = `recipe-draft-${isEditing ? recipe?.id : "new"}`

  // שמירה מקומית של הטופס
  const [draftData, setDraftData, removeDraftData] = useLocalStorage(storageKey, {
    title: recipe?.title || "",
    description: recipe?.description || "",
    categoryId: recipe?.categoryId || "",
    prepTime: recipe?.prepTime?.toString() || "",
    servings: recipe?.servings?.toString() || "",
    difficulty: recipe?.difficulty || "",
    ingredients: recipe?.ingredients?.filter((i) => i.trim() !== "") || [],
    instructions: recipe?.instructions?.filter((i) => i.trim() !== "") || [],
    tips: recipe?.tips?.filter((i) => i.trim() !== "") || [],
    imageUrl: recipe?.image || "",
  })

  const [title, setTitle] = useState(draftData.title)
  const [description, setDescription] = useState(draftData.description)
  const [categoryId, setCategoryId] = useState(draftData.categoryId)
  const [prepTime, setPrepTime] = useState(draftData.prepTime)
  const [servings, setServings] = useState(draftData.servings)
  const [difficulty, setDifficulty] = useState(draftData.difficulty)
  const [ingredients, setIngredients] = useState<string[]>(draftData.ingredients)
  const [instructions, setInstructions] = useState<string[]>(draftData.instructions)
  const [tips, setTips] = useState<string[]>(draftData.tips)
  const [imageUrl, setImageUrl] = useState<string>(draftData.imageUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newIngredient, setNewIngredient] = useState("")
  const [newInstruction, setNewInstruction] = useState("")
  const [newTip, setNewTip] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // States for editing existing items
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null)
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null)
  const [editingTipIndex, setEditingTipIndex] = useState<number | null>(null)
  const [editingIngredientValue, setEditingIngredientValue] = useState("")
  const [editingInstructionValue, setEditingInstructionValue] = useState("")
  const [editingTipValue, setEditingTipValue] = useState("")

  // שמירה אוטומטית של הטופס
  useEffect(() => {
    const currentData = {
      title,
      description,
      categoryId,
      prepTime,
      servings,
      difficulty,
      ingredients,
      instructions,
      tips,
      imageUrl,
    }

    // שמירה רק אם יש שינוי בנתונים
    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(draftData)
    if (hasChanges) {
      setDraftData(currentData)
      setLastSaved(new Date())
    }
  }, [title, description, categoryId, prepTime, servings, difficulty, ingredients, instructions, tips, imageUrl])

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient("")
      setTimeout(() => {
        ingredientInputRef.current?.focus()
      }, 10)
    }
  }

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()])
      setNewInstruction("")
      setTimeout(() => {
        instructionInputRef.current?.focus()
      }, 10)
    }
  }

  const handleAddTip = () => {
    if (newTip.trim()) {
      setTips([...tips, newTip.trim()])
      setNewTip("")
      setTimeout(() => {
        tipInputRef.current?.focus()
      }, 10)
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
    if (editingIngredientIndex === index) {
      setEditingIngredientIndex(null)
    }
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
    if (editingInstructionIndex === index) {
      setEditingInstructionIndex(null)
    }
  }

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index))
    if (editingTipIndex === index) {
      setEditingTipIndex(null)
    }
  }

  // Functions for editing existing items
  const startEditingIngredient = (index: number) => {
    setEditingIngredientIndex(index)
    setEditingIngredientValue(ingredients[index])
  }

  const startEditingInstruction = (index: number) => {
    setEditingInstructionIndex(index)
    setEditingInstructionValue(instructions[index])
  }

  const startEditingTip = (index: number) => {
    setEditingTipIndex(index)
    setEditingTipValue(tips[index])
  }

  const saveEditingIngredient = () => {
    if (editingIngredientIndex !== null && editingIngredientValue.trim()) {
      const newIngredients = [...ingredients]
      newIngredients[editingIngredientIndex] = editingIngredientValue.trim()
      setIngredients(newIngredients)
      setEditingIngredientIndex(null)
      setEditingIngredientValue("")
    }
  }

  const saveEditingInstruction = () => {
    if (editingInstructionIndex !== null && editingInstructionValue.trim()) {
      const newInstructions = [...instructions]
      newInstructions[editingInstructionIndex] = editingInstructionValue.trim()
      setInstructions(newInstructions)
      setEditingInstructionIndex(null)
      setEditingInstructionValue("")
    }
  }

  const saveEditingTip = () => {
    if (editingTipIndex !== null && editingTipValue.trim()) {
      const newTips = [...tips]
      newTips[editingTipIndex] = editingTipValue.trim()
      setTips(newTips)
      setEditingTipIndex(null)
      setEditingTipValue("")
    }
  }

  const cancelEditingIngredient = () => {
    setEditingIngredientIndex(null)
    setEditingIngredientValue("")
  }

  const cancelEditingInstruction = () => {
    setEditingInstructionIndex(null)
    setEditingInstructionValue("")
  }

  const cancelEditingTip = () => {
    setEditingTipIndex(null)
    setEditingTipValue("")
  }

  // Functions for reordering items
  const moveIngredient = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newIngredients = [...ingredients]
      ;[newIngredients[index - 1], newIngredients[index]] = [newIngredients[index], newIngredients[index - 1]]
      setIngredients(newIngredients)
    } else if (direction === "down" && index < ingredients.length - 1) {
      const newIngredients = [...ingredients]
      ;[newIngredients[index], newIngredients[index + 1]] = [newIngredients[index + 1], newIngredients[index]]
      setIngredients(newIngredients)
    }
  }

  const moveInstruction = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newInstructions = [...instructions]
      ;[newInstructions[index - 1], newInstructions[index]] = [newInstructions[index], newInstructions[index - 1]]
      setInstructions(newInstructions)
    } else if (direction === "down" && index < instructions.length - 1) {
      const newInstructions = [...instructions]
      ;[newInstructions[index], newInstructions[index + 1]] = [newInstructions[index + 1], newInstructions[index]]
      setInstructions(newInstructions)
    }
  }

  const moveTip = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newTips = [...tips]
      ;[newTips[index - 1], newTips[index]] = [newTips[index], newTips[index - 1]]
      setTips(newTips)
    } else if (direction === "down" && index < tips.length - 1) {
      const newTips = [...tips]
      ;[newTips[index], newTips[index + 1]] = [newTips[index + 1], newTips[index]]
      setTips(newTips)
    }
  }

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
      if (isOnline) {
        const result = await createCategory(newCategoryName)
        if (result) {
          toast({
            title: "הקטגוריה נוצרה בהצלחה",
            description: `הקטגוריה "${newCategoryName}" נוספה בהצלחה`,
          })
          setCategoryId(result.id)
          setNewCategoryName("")
          setShowNewCategoryInput(false)
          categories.push(result)
        }
      } else {
        // במצב אופליין - שמירה מקומית
        const tempCategory = {
          id: `temp-${Date.now()}`,
          name: newCategoryName,
        }
        categories.push(tempCategory)
        setCategoryId(tempCategory.id)
        setNewCategoryName("")
        setShowNewCategoryInput(false)

        toast({
          title: "קטגוריה נשמרה מקומית",
          description: "הקטגוריה תיווצר בשרת כשתחזור לאינטרנט",
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת הקטגוריה",
        variant: "destructive",
      })
    }
  }

  const handleDirectCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isOnline) {
      toast({
        title: "אין חיבור לאינטרנט",
        description: "העלאת תמונות זמינה רק כשיש חיבור לאינטרנט",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml"]

      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "שגיאה",
          description: "יש להעלות קובץ תמונה בלבד (JPEG, PNG, GIF, WEBP, BMP, SVG)",
          variant: "destructive",
        })
        return
      }

      const maxSize = 20 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: "שגיאה",
          description: "גודל התמונה חייב להיות עד 20MB",
          variant: "destructive",
        })
        return
      }

      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("upload_preset", "recipe_images")

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error("Missing Cloudinary cloud name")
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Cloudinary error:", errorData)
        throw new Error(`שגיאה בהעלאת התמונה: ${errorData.error?.message || "Unknown error"}`)
      }

      const data = await response.json()

      setImageUrl(data.secure_url)
      toast({
        title: "התמונה הועלתה בהצלחה",
        description: "התמונה נשמרה ותוצג במתכון",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת העלאת התמונה. נסה שוב או השתמש בתמונה אחרת.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !categoryId || !prepTime || !servings || !difficulty) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      })
      return
    }

    // Save any pending edits
    if (editingIngredientIndex !== null) {
      saveEditingIngredient()
    }
    if (editingInstructionIndex !== null) {
      saveEditingInstruction()
    }
    if (editingTipIndex !== null) {
      saveEditingTip()
    }

    // Add any pending new items
    if (newIngredient.trim()) {
      handleAddIngredient()
    }
    if (newInstruction.trim()) {
      handleAddInstruction()
    }
    if (newTip.trim()) {
      handleAddTip()
    }

    try {
      setIsSubmitting(true)

      const formData = {
        title,
        description,
        categoryId,
        prepTime: Number.parseInt(prepTime),
        servings: Number.parseInt(servings),
        difficulty,
        ingredients: ingredients.filter((i) => i.trim() !== ""),
        instructions: instructions.filter((i) => i.trim() !== ""),
        tips: tips.filter((i) => i.trim() !== ""),
        image: imageUrl || "/placeholder.svg?height=300&width=400",
      }

      if (isOnline) {
        // מצב אונליין - שליחה ישירה לשרת
        let result

        if (isEditing && recipe) {
          result = await updateRecipe(recipe.id, formData)
        } else {
          result = await createRecipe(formData)
        }

        if (result.success) {
          toast({
            title: isEditing ? "המתכון עודכן בהצלחה!" : "המתכון נשמר בהצלחה!",
            description: isEditing ? "המתכון עודכן בספר המתכונים שלך." : "המתכון החדש נוסף לספר המתכונים שלך.",
          })

          // מחיקת הטיוטה לאחר שמירה מוצלחת
          removeDraftData()

          if (isEditing) {
            router.push(`/recipes/${recipe?.id}`)
          } else {
            router.push("/")
          }
        } else {
          throw new Error(result.error)
        }
      } else {
        // מצב אופליין - שמירה לתור
        if (isEditing && recipe) {
          addOfflineAction({
            type: "update",
            data: { id: recipe.id, formData },
          })
        } else {
          addOfflineAction({
            type: "create",
            data: formData,
          })
        }

        toast({
          title: "נשמר מקומית! 💾",
          description: "המתכון יישמר בשרת כשתחזור לאינטרנט",
        })

        // חזרה לדף הבית
        router.push("/")
      }
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת שמירת המתכון",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Offline Warning */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3"
        >
          <WifiOff className="h-5 w-5 text-amber-600" />
          <div className="flex-grow">
            <h3 className="font-medium text-amber-800">מצב אופליין</h3>
            <p className="text-sm text-amber-700">
              אתה עובד במצב אופליין. המתכון יישמר מקומית ויסונכרן כשתחזור לאינטרנט.
            </p>
          </div>
        </motion.div>
      )}

      {/* Auto-save indicator */}
      {lastSaved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground text-center"
        >
          נשמר אוטומטית ב-{lastSaved.toLocaleTimeString("he-IL")}
        </motion.div>
      )}

      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-heading text-center sm:text-right">
          {isEditing ? "עריכת מתכון" : "הוספת מתכון חדש"}
          {!isOnline && <span className="text-sm font-normal text-muted-foreground block mt-1">(מצב אופליין)</span>}
        </h1>
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="text-sm sm:text-base flex-1 h-11 sm:h-10"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting} className="text-sm sm:text-base flex-1 h-11 sm:h-10">
            <Save className="h-4 w-4 ml-2" />
            {isSubmitting ? "שומר..." : isOnline ? (isEditing ? "עדכן מתכון" : "שמור מתכון") : "שמור מקומית"}
          </Button>
        </div>
      </div>

      {/* Rest of the form components remain the same as in the previous version */}
      {/* I'll include the key sections but keep the same structure */}

      {/* Recipe Basic Info */}
      <Card className="overflow-hidden border border-border/40 shadow-sm">
        <div className="bg-accent/30 p-4 border-b border-border/40">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center">
            <Utensils className="mr-2 h-5 w-5 text-primary" />
            פרטי המתכון
          </h2>
        </div>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base">
              שם המתכון <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="לדוגמה: עוגת שוקולד"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base h-11 sm:h-10"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base">
              תיאור קצר
            </Label>
            <Textarea
              id="description"
              placeholder="תיאור קצר של המתכון..."
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              className="text-base min-h-[100px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Warning for Offline */}
      {!isOnline && (
        <Card className="overflow-hidden border border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-medium text-amber-800">העלאת תמונות</h3>
              <p className="text-sm text-amber-700">
                העלאת תמונות זמינה רק כשיש חיבור לאינטרנט. תוכל להוסיף תמונה מאוחר יותר.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue with the rest of the form components... */}
      {/* The ingredients, instructions, tips sections remain the same */}

      {/* Mobile Sticky Submit Bar */}
      <div className="sticky bottom-4 bg-background/95 backdrop-blur-md p-4 rounded-lg border border-border/40 shadow-lg z-10 mx-4 sm:mx-0">
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1 h-11 sm:h-10">
            <ArrowLeft className="h-4 w-4 ml-2" />
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 sm:h-10">
            <Save className="h-4 w-4 ml-2" />
            {isSubmitting ? "שומר..." : isOnline ? (isEditing ? "עדכן מתכון" : "שמור מתכון") : "שמור מקומית"}
            {!isOnline && <WifiOff className="h-3 w-3 mr-1" />}
          </Button>
        </div>
      </div>
    </form>
  )
}
