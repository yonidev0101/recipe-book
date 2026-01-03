"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, ChevronDown, ChevronUp, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createRecipe, updateRecipe, createCategory } from "@/app/actions/recipes"
import { ImageUpload } from "@/components/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import type { Category, Recipe } from "@/lib/types"

interface RecipeFormProps {
  categories: Category[]
  recipe?: Recipe
  isEditing?: boolean
}

export function RecipeForm({ categories, recipe, isEditing = false }: RecipeFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(recipe?.title || "")
  const [description, setDescription] = useState(recipe?.description || "")
  const [categoryId, setCategoryId] = useState(recipe?.categoryId || "")
  const [prepTime, setPrepTime] = useState(recipe?.prepTime?.toString() || "")
  const [servings, setServings] = useState(recipe?.servings?.toString() || "")
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || "")
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients || [""])
  const [instructions, setInstructions] = useState<string[]>(recipe?.instructions || [""])
  const [tips, setTips] = useState<string[]>(recipe?.tips || [""])
  const [imageUrl, setImageUrl] = useState<string>(recipe?.image || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const addIngredient = () => setIngredients([...ingredients, ""])
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const addInstruction = () => setInstructions([...instructions, ""])
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index))
    }
  }

  const addTip = () => setTips([...tips, ""])
  const removeTip = (index: number) => {
    if (tips.length > 1) {
      setTips(tips.filter((_, i) => i !== index))
    }
  }

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
      setIsCreatingCategory(true)
      const result = await createCategory(newCategoryName)

      if (result) {
        toast({
          title: "הקטגוריה נוצרה בהצלחה",
          description: `הקטגוריה "${newCategoryName}" נוספה בהצלחה`,
        })
        setCategoryId(result.id)
        setNewCategoryName("")
        setIsDialogOpen(false)

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
    } finally {
      setIsCreatingCategory(false)
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

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-heading">
          {isEditing ? "עריכת מתכון" : "הוספת מתכון חדש"}
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="text-base flex-1 sm:flex-none"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting} className="text-base flex-1 sm:flex-none">
            <Save className="h-4 w-4 ml-2" />
            {isSubmitting ? "שומר..." : isEditing ? "עדכן מתכון" : "שמור מתכון"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="details" className="text-sm sm:text-base">
            פרטים כלליים
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="text-sm sm:text-base">
            מרכיבים
          </TabsTrigger>
          <TabsTrigger value="instructions" className="text-sm sm:text-base">
            אופן ההכנה
          </TabsTrigger>
          <TabsTrigger value="tips" className="text-sm sm:text-base">
            טיפים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <motion.div variants={tabVariants} initial="hidden" animate="visible">
            <Card className="border border-border/40 shadow-sm">
              <CardHeader className="bg-accent/30 rounded-t-lg">
                <CardTitle className="text-xl sm:text-2xl">פרטי המתכון</CardTitle>
                <CardDescription>הזן את המידע הבסיסי על המתכון</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-3">
                  <Label htmlFor="title" className="text-base">
                    שם המתכון
                  </Label>
                  <Input
                    id="title"
                    placeholder="לדוגמה: עוגת שוקולד"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-base"
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="description" className="text-base">
                    תיאור קצר
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="תיאור קצר של המתכון..."
                    value={description || ""}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-base min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="category" className="text-base">
                      קטגוריה
                    </Label>
                    <div className="flex gap-2">
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger id="category" className="text-base flex-1">
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

                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" type="button" className="shrink-0">
                            <Plus className="h-4 w-4 ml-1" />
                            חדש
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>הוספת קטגוריה חדשה</DialogTitle>
                            <DialogDescription>
                              הזן שם לקטגוריה החדשה. הקטגוריה תהיה זמינה לכל המתכונים.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="new-category" className="text-right">
                                שם הקטגוריה
                              </Label>
                              <Input
                                id="new-category"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="לדוגמה: מאפים"
                                className="text-base"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              onClick={handleCreateCategory}
                              disabled={isCreatingCategory}
                              className="w-full"
                            >
                              {isCreatingCategory ? "יוצר..." : "צור קטגוריה"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="difficulty" className="text-base">
                      רמת קושי
                    </Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty" className="text-base">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="prepTime" className="text-base">
                      זמן הכנה (בדקות)
                    </Label>
                    <Input
                      id="prepTime"
                      type="number"
                      min="1"
                      placeholder="30"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="text-base"
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="servings" className="text-base">
                      מספר מנות
                    </Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      placeholder="4"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="text-base"
                      required
                    />
                  </div>
                </div>

                <ImageUpload defaultImage={recipe?.image} onImageUpload={(url) => setImageUrl(url)} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="ingredients">
          <motion.div variants={tabVariants} initial="hidden" animate="visible">
            <Card className="border border-border/40 shadow-sm">
              <CardHeader className="bg-accent/30 rounded-t-lg">
                <CardTitle className="text-xl sm:text-2xl">מרכיבים</CardTitle>
                <CardDescription>הוסף את כל המרכיבים הדרושים למתכון</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex flex-col gap-1 mr-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveIngredient(index, "up")}
                        disabled={index === 0}
                        className="h-6 w-6"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveIngredient(index, "down")}
                        disabled={index === ingredients.length - 1}
                        className="h-6 w-6"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-none pt-2 pl-2 text-primary font-bold">{index + 1}.</div>
                    <Input
                      value={ingredient}
                      onChange={(e) => {
                        const newIngredients = [...ingredients]
                        newIngredients[index] = e.target.value
                        setIngredients(newIngredients)
                      }}
                      placeholder="לדוגמה: 2 כוסות קמח"
                      className="text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-base group hover:bg-primary hover:text-primary-foreground"
                  onClick={addIngredient}
                >
                  <Plus className="h-4 w-4 ml-2 group-hover:text-primary-foreground" />
                  הוסף מרכיב
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="instructions">
          <motion.div variants={tabVariants} initial="hidden" animate="visible">
            <Card className="border border-border/40 shadow-sm">
              <CardHeader className="bg-accent/30 rounded-t-lg">
                <CardTitle className="text-xl sm:text-2xl">אופן ההכנה</CardTitle>
                <CardDescription>פרט את שלבי ההכנה של המתכון</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex flex-col gap-1 mr-1 mt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveInstruction(index, "up")}
                        disabled={index === 0}
                        className="h-6 w-6"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveInstruction(index, "down")}
                        disabled={index === instructions.length - 1}
                        className="h-6 w-6"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-none pt-3 pl-2 text-primary font-bold">{index + 1}.</div>
                    <Textarea
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...instructions]
                        newInstructions[index] = e.target.value
                        setInstructions(newInstructions)
                      }}
                      placeholder="תאר את שלב ההכנה..."
                      className="text-base min-h-[100px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-base group hover:bg-primary hover:text-primary-foreground"
                  onClick={addInstruction}
                >
                  <Plus className="h-4 w-4 ml-2 group-hover:text-primary-foreground" />
                  הוסף שלב
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="tips">
          <motion.div variants={tabVariants} initial="hidden" animate="visible">
            <Card className="border border-border/40 shadow-sm">
              <CardHeader className="bg-accent/30 rounded-t-lg">
                <CardTitle className="text-xl sm:text-2xl">טיפים</CardTitle>
                <CardDescription>הוסף טיפים שימושיים למתכון (אופציונלי)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {tips.map((tip, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-none pt-3 pl-2 text-primary font-bold">•</div>
                    <Input
                      value={tip}
                      onChange={(e) => {
                        const newTips = [...tips]
                        newTips[index] = e.target.value
                        setTips(newTips)
                      }}
                      placeholder="הוסף טיפ שימושי..."
                      className="text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeTip(index)}
                      className="shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-base group hover:bg-primary hover:text-primary-foreground"
                  onClick={addTip}
                >
                  <Plus className="h-4 w-4 ml-2 group-hover:text-primary-foreground" />
                  הוסף טיפ
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 bg-background/80 backdrop-blur-md p-4 rounded-lg border border-border/40 shadow-lg z-10">
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => router.push("/")} className="text-base">
            <ArrowLeft className="h-4 w-4 ml-2" />
            ביטול
          </Button>
          <div className="flex gap-2">
            {activeTab !== "details" && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const tabs = ["details", "ingredients", "instructions", "tips"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1])
                  }
                }}
                className="text-base"
              >
                הקודם
              </Button>
            )}
            {activeTab !== "tips" && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const tabs = ["details", "ingredients", "instructions", "tips"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1])
                  }
                }}
                className="text-base"
              >
                הבא
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="text-base">
              <Save className="h-4 w-4 ml-2" />
              {isSubmitting ? "שומר..." : isEditing ? "עדכן מתכון" : "שמור מתכון"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
