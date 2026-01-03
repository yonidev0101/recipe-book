"use client"

import { motion } from "framer-motion"
import { Upload, Check, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UploadProgressProps {
  progress: number
  status: "uploading" | "success" | "error"
  fileName?: string
}

export function UploadProgress({ progress, status, fileName }: UploadProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-card border border-border rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`p-2 rounded-full ${
            status === "uploading"
              ? "bg-blue-100 text-blue-600"
              : status === "success"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
          }`}
        >
          {status === "uploading" && <Upload className="h-4 w-4" />}
          {status === "success" && <Check className="h-4 w-4" />}
          {status === "error" && <X className="h-4 w-4" />}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-medium">
            {status === "uploading" && "מעלה תמונה..."}
            {status === "success" && "התמונה הועלתה בהצלחה!"}
            {status === "error" && "שגיאה בהעלאת התמונה"}
          </p>
          {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>

      <Progress
        value={progress}
        className={`h-2 ${status === "success" ? "bg-green-100" : status === "error" ? "bg-red-100" : ""}`}
      />
    </motion.div>
  )
}
