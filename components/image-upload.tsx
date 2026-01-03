"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UploadProgress } from "@/components/loading/upload-progress"
import { LoadingSpinner } from "@/components/loading/loading-spinner"
import { motion, AnimatePresence } from "framer-motion"

interface ImageUploadProps {
  defaultImage?: string
  onImageUpload: (imageUrl: string) => void
}

export function ImageUpload({ defaultImage, onImageUpload }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"uploading" | "success" | "error">("uploading")
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const simulateProgress = () => {
    setUploadProgress(0)
    setUploadStatus("uploading")

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return interval
  }

  const handleFileUpload = async (file: File) => {
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/svg+xml",
    ]

    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "שגיאה",
        description: "יש להעלות קובץ תמונה בלבד (JPEG, PNG, GIF, WEBP, BMP, TIFF, SVG)",
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

    try {
      setIsUploading(true)
      setFileName(file.name)
      const progressInterval = simulateProgress()

      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("upload_preset", "recipe-images")

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "doxhxgwwq"
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formDataUpload,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("שגיאה בהעלאת התמונה")
      }

      const data = await response.json()

      setUploadProgress(100)
      setUploadStatus("success")

      setTimeout(() => {
        setImage(data.secure_url)
        onImageUpload(data.secure_url)
        toast({
          title: "התמונה הועלתה בהצלחה",
          description: "התמונה נשמרה ותוצג במתכון",
        })
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadStatus("error")
      setUploadProgress(0)

      setTimeout(() => {
        setIsUploading(false)
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעת העלאת התמונה. אנא נסה שוב מאוחר יותר.",
          variant: "destructive",
        })
      }, 1000)
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setImage(null)
    onImageUpload("")
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <div className="grid gap-3">
      <Label htmlFor="image" className="text-base">
        תמונה
      </Label>

      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <UploadProgress progress={uploadProgress} status={uploadStatus} fileName={fileName} />
          </motion.div>
        )}
      </AnimatePresence>

      {image ? (
        <motion.div
          className="relative rounded-lg overflow-hidden border border-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="aspect-video relative">
            <Image src={image || "/placeholder.svg"} alt="תמונת המתכון" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
          {uploadStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full"
            >
              <CheckCircle className="h-4 w-4" />
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
            dragActive ? "border-primary bg-primary/10" : "bg-accent/30"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            ref={inputRef}
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <LoadingSpinner size="lg" className="text-primary mb-3" />
              <p className="text-base text-muted-foreground">מעלה תמונה...</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-primary mb-3" />
              <p className="text-base text-muted-foreground mb-2">גרור תמונה לכאן או</p>
              <Button type="button" variant="outline" size="sm" className="text-base" onClick={handleButtonClick}>
                <ImageIcon className="h-4 w-4 ml-2" />
                בחר קובץ
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                פורמטים נתמכים: JPG, PNG, GIF, WEBP, BMP, TIFF, SVG. גודל מקסימלי: 20MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
