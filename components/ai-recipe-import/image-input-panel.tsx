"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, Sparkles } from "lucide-react"
import { LoadingSpinner } from "@/components/loading/loading-spinner"
import Image from "next/image"

interface ImageInputPanelProps {
  onParse: (file: File) => Promise<void>
  isLoading: boolean
}

export function ImageInputPanel({ onParse, isLoading }: ImageInputPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // בדיקת סוג הקובץ
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      alert("נא להעלות קובץ תמונה (JPG, PNG, WebP)")
      return
    }

    // בדיקת גודל (20MB)
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      alert("התמונה גדולה מדי. הגודל המקסימלי הוא 20MB")
      return
    }

    setSelectedFile(file)

    // יצירת preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleParse = () => {
    if (selectedFile) {
      onParse(selectedFile)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">
          <ImageIcon className="h-4 w-4 inline ml-2" />
          העלה תמונה של מתכון
        </Label>

        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            } ${isLoading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-base font-medium mb-2">גרור תמונה לכאן או לחץ לבחירה</p>
            <p className="text-sm text-muted-foreground mb-4">תומך ב-JPG, PNG, WebP (עד 20MB)</p>
            <Button type="button" variant="outline" disabled={isLoading}>
              בחר קובץ
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleInputChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {previewUrl && (
                <Image src={previewUrl} alt="תצוגה מקדימה" fill className="object-contain" unoptimized />
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClear} disabled={isLoading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <>
          <Button onClick={handleParse} disabled={isLoading} size="lg" className="w-full gap-2">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                מנתח את התמונה...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                נתח תמונה עם AI
              </>
            )}
          </Button>

          {!isLoading && (
            <p className="text-xs text-center text-muted-foreground">
              הבוט יקרא את הטקסט מהתמונה ויזהה את כל פרטי המתכון
            </p>
          )}
        </>
      )}
    </div>
  )
}
