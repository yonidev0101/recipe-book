"use client"

import { useState, useEffect } from "react"
import { OptimizedImage } from "./optimized-image"
import { cloudinaryOptimizer, CloudinaryOptimizer } from "@/lib/cloudinary-optimizer"

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  aspectRatio?: "square" | "video" | "portrait" | "auto"
  cloudinaryType?: "card" | "detail" | "hero" | "thumbnail"
  showLoadingAnimation?: boolean
  onLoad?: () => void
  onError?: () => void
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
}

export function ResponsiveImage({
  src,
  alt,
  className = "",
  priority = false,
  aspectRatio = "video",
  cloudinaryType = "card",
  showLoadingAnimation = true,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [responsiveUrls, setResponsiveUrls] = useState<string[]>([])

  useEffect(() => {
    if (CloudinaryOptimizer.isCloudinaryUrl(src)) {
      const publicId = CloudinaryOptimizer.extractPublicId(src)
      if (publicId) {
        // יצירת URLs responsive לגדלים שונים
        const sizes = [
          { breakpoint: "sm", width: 400, height: cloudinaryType === "card" ? 300 : undefined },
          { breakpoint: "md", width: 600, height: cloudinaryType === "card" ? 400 : undefined },
          { breakpoint: "lg", width: 800, height: cloudinaryType === "card" ? 600 : undefined },
          { breakpoint: "xl", width: 1200, height: cloudinaryType === "card" ? 800 : undefined },
        ]

        const urls = cloudinaryOptimizer.buildResponsiveUrls(publicId, sizes, {
          quality: "auto:good",
          fetchFormat: "auto",
          dpr: "auto",
          crop: "fill",
          gravity: "auto",
        })

        setResponsiveUrls(urls.map((item) => item.url))
      }
    }
  }, [src, cloudinaryType])

  // בניית srcSet עבור responsive images
  const srcSet =
    responsiveUrls.length > 0
      ? responsiveUrls
          .map((url, index) => {
            const widths = [400, 600, 800, 1200]
            return `${url} ${widths[index]}w`
          })
          .join(", ")
      : undefined

  const sizes =
    cloudinaryType === "hero"
      ? "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      : cloudinaryType === "detail"
        ? "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"

  return (
    <div className={`relative ${aspectRatioClasses[aspectRatio]} ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        cloudinaryType={cloudinaryType}
        showLoadingAnimation={showLoadingAnimation}
        onLoad={onLoad}
        onError={onError}
        className="rounded-lg"
      />

      {/* Progressive Enhancement */}
      {srcSet && (
        <picture className="hidden">
          <source srcSet={srcSet} sizes={sizes} />
        </picture>
      )}
    </div>
  )
}
