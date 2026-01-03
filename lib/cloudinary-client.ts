"use client"

import type React from "react"

import { CldUploadWidget } from "next-cloudinary"

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void
  children: React.ReactNode
}

export function CloudinaryUploadWidget({ onUpload, children }: CloudinaryUploadWidgetProps) {
  return (
    <CldUploadWidget
      uploadPreset="recipe-images"
      options={{
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"],
        maxFileSize: 20000000, // 20MB
        folder: "recipe-images",
      }}
      onSuccess={(result, { widget }) => {
        if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
          onUpload(result.info.secure_url as string)
        }
        widget.close()
      }}
    >
      {children}
    </CldUploadWidget>
  )
}
