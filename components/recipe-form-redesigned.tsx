"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { createRecipe, updateRecipe, createCategory } from "@/app/actions/recipes"
import {
  Plus,
  Minus,
  Save,
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  ImageIcon,
  Utensils,
  ListOrdered,
  LightbulbIcon,
  PlusCircle,
  Info,
  Upload,
  Edit3,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import type { Category, Recipe } from "@/lib/types"

interface RecipeFormProps {
  categories: Category[]
  recipe?: Recipe
  isEditing?: boolean
}

export function RecipeFormRedesigned({ categories, recipe, isEditing = false }: RecipeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const ingredientInputRef = useRef<HTMLInputElement>(null)
  const instructionInputRef = useRef<HTMLTextAreaElement>(null)
  const tipInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(recipe?.title || "")
  const [description, setDescription] = useState(recipe?.description || "")
  const [categoryId, setCategoryId] = useState(recipe?.categoryId || "")
  const [prepTime, setPrepTime] = useState(recipe?.prepTime?.toString() || "")
  const [servings, setServings] = useState(recipe?.servings?.toString() || "")
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || "")
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients?.filter((i) => i.trim() !== "") || [])
  const [instructions, setInstructions] = useState<string[]>(recipe?.instructions?.filter((i) => i.trim() !== "") || [])
  const [tips, setTips] = useState<string[]>(recipe?.tips?.filter((i) => i.trim() !== "") || [])
  const [imageUrl, setImageUrl] = useState<string>(recipe?.image || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newIngredient, setNewIngredient] = useState("")
  const [newInstruction, setNewInstruction] = useState("")
  const [newTip, setNewTip] = useState("")

  // States for editing existing items
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null)
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null)
  const [editingTipIndex, setEditingTipIndex] = useState<number | null>(null)
  const [editingIngredientValue, setEditingIngredientValue] = useState("")
  const [editingInstructionValue, setEditingInstructionValue] = useState("")
  const [editingTipValue, setEditingTipValue] = useState("")

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
      const result = await createCategory(newCategoryName)

      if (result) {
        toast({
          title: "הקטגוריה נוצרה בהצלחה",
          description: `הקטגוריה "${newCategoryName}" נוספה בהצלחה`,
        })
        setCategoryId(result.id)
        setNewCategoryName("")
        setShowNewCategoryInput(false)

        // Add the new category to the local categories array
        categories.push(result)
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
    }
  }

  // אפשרות חלופית: העלאה ישירה ל-Cloudinary מצד הלקוח
  const handleDirectCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // בדיקת סוג הקובץ
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml"]

      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "שגיאה",
          description: "יש להעלות קובץ תמונה בלבד (JPEG, PNG, GIF, WEBP, BMP, SVG)",
          variant: "destructive",
        })
        return
      }

      // בדיקת גודל הקובץ (מקסימום 20MB)
      const maxSize = 20 * 1024 * 1024 // 20MB
      if (file.size > maxSize) {
        toast({
          title: "שגיאה",
          description: "גודל התמונה חייב להיות עד 20MB",
          variant: "destructive",
        })
        return
      }

      // העלאה ישירה ל-Cloudinary
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("upload_preset", "recipe_images") // שם ה-upload preset שהגדרת ב-Cloudinary

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
      // איפוס שדה הקובץ כדי לאפשר העלאה חוזרת של אותו קובץ
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

        if (isEditing) {
          router.push(`/recipes/${recipe?.id}`)
        } else {
          router.push("/")
        }
      } else {
        throw new Error(result.error)
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
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-heading text-center sm:text-right">
          {isEditing ? "עריכת מתכון" : "הוספת מתכון חדש"}
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
            {isSubmitting ? "שומר..." : isEditing ? "עדכן מתכון" : "שמור מתכון"}
          </Button>
        </div>
      </div>

      {/* Mobile-First Layout */}
      <div className="space-y-6">
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

        {/* Recipe Details - Mobile Optimized */}
        <Card className="overflow-hidden border border-border/40 shadow-sm">
          <div className="bg-accent/30 p-4 border-b border-border/40">
            <h2 className="text-lg sm:text-xl font-semibold">פרטים נוספים</h2>
          </div>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Category */}
            <div className="space-y-3">
              <Label htmlFor="category" className="text-base">
                קטגוריה <span className="text-red-500">*</span>
              </Label>
              {!showNewCategoryInput ? (
                <div className="flex gap-2">
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category" className="text-base flex-1 h-11 sm:h-10">
                      <SelectValue placeholder="בחר קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-base">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="shrink-0 h-11 w-11 sm:h-10 sm:w-10"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="שם קטגוריה חדשה"
                      className="text-base flex-1 h-11 sm:h-10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowNewCategoryInput(false)}
                      className="shrink-0 h-11 w-11 sm:h-10 sm:w-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim()}
                    className="w-full h-11 sm:h-10"
                  >
                    צור קטגוריה חדשה
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Recipe Metadata - Mobile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Difficulty */}
              <div className="space-y-3">
                <Label htmlFor="difficulty" className="text-base flex items-center">
                  <ChefHat className="h-4 w-4 ml-2 text-primary" />
                  רמת קושי <span className="text-red-500">*</span>
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="text-base h-11 sm:h-10">
                    <SelectValue placeholder="בחר רמת קושי" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="קל" className="text-base">
                      קל
                    </SelectItem>
                    <SelectItem value="בינוני" className="text-base">
                      בינוני
                    </SelectItem>
                    <SelectItem value="מורכב" className="text-base">
                      מורכב
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prep Time */}
              <div className="space-y-3">
                <Label htmlFor="prepTime" className="text-base flex items-center">
                  <Clock className="h-4 w-4 ml-2 text-primary" />
                  זמן הכנה (דקות) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="text-base h-11 sm:h-10"
                  required
                />
              </div>

              {/* Servings */}
              <div className="space-y-3">
                <Label htmlFor="servings" className="text-base flex items-center">
                  <Users className="h-4 w-4 ml-2 text-primary" />
                  מספר מנות <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  placeholder="4"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="text-base h-11 sm:h-10"
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Image Upload - Mobile Optimized */}
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <ImageIcon className="h-4 w-4 ml-2 text-primary" />
                תמונת המתכון
              </Label>

              {imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border aspect-video">
                  <img src={imageUrl || "/placeholder.svg"} alt="תמונת המתכון" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-9 w-9 rounded-full p-0"
                    onClick={() => setImageUrl("")}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/20 transition-colors">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">העלה תמונה למתכון שלך</p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDirectCloudinaryUpload}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    className="mx-auto h-11 sm:h-10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                        מעלה...
                      </span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 ml-2" />
                        בחר תמונה
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ingredients Section - Mobile Optimized */}
        <Card className="overflow-hidden border border-border/40 shadow-sm">
          <div className="bg-accent/30 p-4 border-b border-border/40">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center">
              <ListOrdered className="mr-2 h-5 w-5 text-primary" />
              מרכיבים
            </h2>
          </div>
          <CardContent className="p-4 sm:p-6">
            <div className="bg-blue-50 dark:bg-blue-950/50 p-3 sm:p-4 rounded-lg mb-4 text-sm border border-blue-200 dark:border-blue-900">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center">
                <Info className="h-4 w-4 ml-1" />
                כיצד להזין מרכיבים
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm">
                הזן את המרכיבים בפורמט: <strong>כמות יחידה שם המרכיב</strong>. לדוגמא:
              </p>
              <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-400 pr-4 text-xs sm:text-sm">
                <li>2 כוסות קמח</li>
                <li>200 גרם שוקולד</li>
                <li>1/2 כפית מלח</li>
              </ul>
            </div>

            <AnimatePresence>
              {ingredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 space-y-3"
                >
                  {ingredients.map((ingredient, index) => (
                    <motion.div
                      key={`${index}-${ingredient.substring(0, 10)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group"
                    >
                      {editingIngredientIndex === index ? (
                        <div className="space-y-3">
                          <Input
                            value={editingIngredientValue}
                            onChange={(e) => setEditingIngredientValue(e.target.value)}
                            className="text-base h-11 sm:h-10"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                saveEditingIngredient()
                              } else if (e.key === "Escape") {
                                cancelEditingIngredient()
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={saveEditingIngredient}
                              className="flex-1 h-10 text-green-600 bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              שמור
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingIngredient}
                              className="flex-1 h-10 text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4 mr-1" />
                              ביטול
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                          {/* Drag Handle - Mobile */}
                          <div className="flex flex-col gap-1 sm:hidden">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveIngredient(index, "up")}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveIngredient(index, "down")}
                              disabled={index === ingredients.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Desktop Drag Handle */}
                          <div className="hidden sm:flex flex-col gap-1 mr-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveIngredient(index, "up")}
                              disabled={index === 0}
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveIngredient(index, "down")}
                              disabled={index === ingredients.length - 1}
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex-none w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                            {index + 1}
                          </div>

                          <div className="flex-grow text-sm sm:text-base">{ingredient}</div>

                          {/* Action Buttons - Always visible on mobile */}
                          <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditingIngredient(index)}
                              className="h-8 w-8 sm:h-6 sm:w-6 text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeIngredient(index)}
                              className="h-8 w-8 sm:h-6 sm:w-6 text-red-500 hover:text-red-600"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <Input
                ref={ingredientInputRef}
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="הוסף מרכיב חדש..."
                className="text-base h-11 sm:h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddIngredient()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddIngredient}
                className="w-full h-11 sm:h-10"
                disabled={!newIngredient.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                הוסף מרכיב
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Section - Mobile Optimized */}
        <Card className="overflow-hidden border border-border/40 shadow-sm">
          <div className="bg-accent/30 p-4 border-b border-border/40">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center">
              <ListOrdered className="mr-2 h-5 w-5 text-primary" />
              אופן ההכנה
            </h2>
          </div>
          <CardContent className="p-4 sm:p-6">
            <AnimatePresence>
              {instructions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 space-y-4"
                >
                  {instructions.map((instruction, index) => (
                    <motion.div
                      key={`${index}-${instruction.substring(0, 10)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group"
                    >
                      {editingInstructionIndex === index ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editingInstructionValue}
                            onChange={(e) => setEditingInstructionValue(e.target.value)}
                            className="text-base min-h-[120px] resize-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.ctrlKey) {
                                e.preventDefault()
                                saveEditingInstruction()
                              } else if (e.key === "Escape") {
                                cancelEditingInstruction()
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={saveEditingInstruction}
                              className="flex-1 h-10 text-green-600 bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              שמור
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingInstruction}
                              className="flex-1 h-10 text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4 mr-1" />
                              ביטול
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          {/* Mobile Reorder Buttons */}
                          <div className="flex flex-col gap-1 sm:hidden mt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveInstruction(index, "up")}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveInstruction(index, "down")}
                              disabled={index === instructions.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Desktop Reorder Buttons */}
                          <div className="hidden sm:flex flex-col gap-1 mr-1 mt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveInstruction(index, "up")}
                              disabled={index === 0}
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveInstruction(index, "down")}
                              disabled={index === instructions.length - 1}
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mt-2">
                            {index + 1}
                          </div>

                          <div className="flex-grow p-3 sm:p-4 bg-accent/20 rounded-lg text-sm sm:text-base">
                            {instruction}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-1 mt-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditingInstruction(index)}
                              className="h-8 w-8 sm:h-6 sm:w-6 text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInstruction(index)}
                              className="h-8 w-8 sm:h-6 sm:w-6 text-red-500 hover:text-red-600"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <Textarea
                ref={instructionInputRef}
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                placeholder="הוסף שלב הכנה חדש..."
                className="text-base min-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault()
                    handleAddInstruction()
                  }
                }}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                <span>לחץ Ctrl+Enter להוספה מהירה</span>
              </div>
              <Button
                type="button"
                onClick={handleAddInstruction}
                className="w-full h-11 sm:h-10"
                disabled={!newInstruction.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                הוסף שלב
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section - Mobile Optimized */}
        <Card className="overflow-hidden border border-border/40 shadow-sm">
          <div className="bg-accent/30 p-4 border-b border-border/40">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center">
              <LightbulbIcon className="mr-2 h-5 w-5 text-primary" />
              טיפים (אופציונלי)
            </h2>
          </div>
          <CardContent className="p-4 sm:p-6">
            <AnimatePresence>
              {tips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 space-y-3"
                >
                  {tips.map((tip, index) => (
                    <motion.div
                      key={`${index}-${tip.substring(0, 10)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group"
                    >
                      {editingTipIndex === index ? (
                        <div className="space-y-3">
                          <Input
                            value={editingTipValue}
                            onChange={(e) => setEditingTipValue(e.target.value)}
                            className="text-base h-11 sm:h-10"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                saveEditingTip()
                              } else if (e.key === "Escape") {
                                cancelEditingTip()
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={saveEditingTip}
                              className="flex-1 h-10 text-green-600 bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              שמור
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingTip}
                              className="flex-1 h-10 text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4 mr-1" />
                              ביטול
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                          {/* Mobile Reorder Buttons */}
                          <div className="flex flex-col gap-1 sm:hidden">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveTip(index, "up")}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveTip(index, "down")}
                              disabled={index === tips.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Desktop Reorder Buttons */}
                          <div className="hidden sm:flex flex-col gap-1 mr-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveTip(index, "up")}
                              disabled={index === 0}
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveTip(index, "down")}
                              disabled={index === tips.length - 1}
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex-none text-primary font-bold">•</div>

                          <div className="flex-grow text-sm sm:text-base">{tip}</div>

                          {/* Action Buttons */}
                          <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditingTip(index)}
                              className="h-8 w-8 sm:h-6 sm:w-6 text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTip(index)}
                              className="h-8 w-8 sm:h-6 sm:w-6 text-red-500 hover:text-red-600"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <Input
                ref={tipInputRef}
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="הוסף טיפ חדש..."
                className="text-base h-11 sm:h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTip()
                  }
                }}
              />
              <Button type="button" onClick={handleAddTip} className="w-full h-11 sm:h-10" disabled={!newTip.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                הוסף טיפ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Sticky Submit Bar */}
      <div className="sticky bottom-4 bg-background/95 backdrop-blur-md p-4 rounded-lg border border-border/40 shadow-lg z-10 mx-4 sm:mx-0">
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1 h-11 sm:h-10">
            <ArrowLeft className="h-4 w-4 ml-2" />
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 sm:h-10">
            <Save className="h-4 w-4 ml-2" />
            {isSubmitting ? "שומר..." : isEditing ? "עדכן מתכון" : "שמור מתכון"}
          </Button>
        </div>
      </div>
    </form>
  )
}
