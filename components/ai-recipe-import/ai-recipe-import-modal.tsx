"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { TextInputPanel } from "./text-input-panel"
import { ImageInputPanel } from "./image-input-panel"
import { RecipePreviewEditor } from "./recipe-preview-editor"
import { getCategories } from "@/app/actions/recipes"
import type { ParsedRecipe } from "@/lib/ai-recipe-import/schema"
import type { Category } from "@/lib/types"

interface AiRecipeImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

type Mode = "input" | "preview"
type InputMode = "text" | "image"

export function AiRecipeImportModal({ open, onOpenChange, trigger }: AiRecipeImportModalProps) {
  const [mode, setMode] = useState<Mode>("input")
  const [inputMode, setInputMode] = useState<InputMode>("text")
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // טעינת קטגוריות בפתיחת ה-modal
  useEffect(() => {
    if (open && categories.length === 0) {
      loadCategories()
    }
  }, [open])

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const result = await getCategories()
      setCategories(result)
    } catch (err) {
      console.error("Error loading categories:", err)
      setError("שגיאה בטעינת הקטגוריות")
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleParseText = async (text: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-recipe-import/parse-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          existingCategories: categories.map((c) => c.name),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "שגיאה בניתוח המתכון")
      }

      setParsedRecipe(result.data)
      setMode("preview")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "שגיאה לא צפויה"
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleParseImage = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("existingCategories", JSON.stringify(categories.map((c) => c.name)))

      const response = await fetch("/api/ai-recipe-import/parse-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "שגיאה בניתוח התמונה")
      }

      setParsedRecipe(result.data)
      setUploadedImageUrl(result.imageUrl || null)
      setMode("preview")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "שגיאה לא צפויה"
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    setMode("input")
    setError(null)
  }

  const handleSuccess = () => {
    // איפוס הכל לאחר שמירה מוצלחת
    setMode("input")
    setParsedRecipe(null)
    setUploadedImageUrl(null)
    setError(null)
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isProcessing) {
      // איפוס state בסגירה
      setMode("input")
      setParsedRecipe(null)
      setUploadedImageUrl(null)
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">ייבוא חכם של מתכונים עם AI</DialogTitle>
          <DialogDescription>
            הדבק טקסט של מתכון או העלה תמונה, והבוט יפענח אוטומטית את כל הפרטים
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>שגיאה</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoadingCategories ? (
          <div className="py-12 text-center text-muted-foreground">טוען קטגוריות...</div>
        ) : categories.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>לא נמצאו קטגוריות</AlertTitle>
            <AlertDescription>נא ליצור קטגוריות לפני שימוש בייבוא חכם</AlertDescription>
          </Alert>
        ) : mode === "input" ? (
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">הדבקת טקסט</TabsTrigger>
              <TabsTrigger value="image">העלאת תמונה</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-6">
              <TextInputPanel onParse={handleParseText} isLoading={isProcessing} />
            </TabsContent>
            <TabsContent value="image" className="mt-6">
              <ImageInputPanel onParse={handleParseImage} isLoading={isProcessing} />
            </TabsContent>
          </Tabs>
        ) : (
          parsedRecipe && (
            <RecipePreviewEditor
              parsedRecipe={parsedRecipe}
              categories={categories}
              imageUrl={uploadedImageUrl}
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
