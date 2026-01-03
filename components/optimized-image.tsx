"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cloudinaryOptimizer, CloudinaryOptimizer } from "@/lib/cloudinary-optimizer"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  // Cloudinary specific props
  cloudinarySize?: "small" | "medium" | "large"
  cloudinaryType?: "card" | "detail" | "hero" | "thumbnail"
  enableProgressiveLoading?: boolean
  showLoadingAnimation?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  objectFit = "cover",
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
  cloudinarySize = "medium",
  cloudinaryType = "card",
  enableProgressiveLoading = true,
  showLoadingAnimation = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState(src)
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState<string>()

  useEffect(() => {
    if (CloudinaryOptimizer.isCloudinaryUrl(src)) {
      const publicId = CloudinaryOptimizer.extractPublicId(src)
      if (publicId) {
        let optimizedUrl: string

        // בחירת אופטימיזציה לפי סוג התמונה
        switch (cloudinaryType) {
          case "detail":
            optimizedUrl = cloudinaryOptimizer.buildRecipeDetailImage(publicId)
            break
          case "hero":
            optimizedUrl = cloudinaryOptimizer.buildHeroImage(publicId)
            break
          case "thumbnail":
            optimizedUrl = cloudinaryOptimizer.buildThumbnail(publicId, width || 150)
            break
          default:
            optimizedUrl = cloudinaryOptimizer.buildRecipeCardImage(publicId, cloudinarySize)
        }

        setOptimizedSrc(optimizedUrl)

        // יצירת blur placeholder אם לא סופק
        if (placeholder === "blur" && !blurDataURL && enableProgressiveLoading) {
          const blurUrl = cloudinaryOptimizer.buildBlurPlaceholder(publicId)
          setGeneratedBlurDataURL(blurUrl)
        }
      }
    }
  }, [src, cloudinarySize, cloudinaryType, width, placeholder, blurDataURL, enableProgressiveLoading])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Responsive sizes for different breakpoints
  const responsiveSizes =
    sizes ||
    (cloudinaryType === "hero"
      ? "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      : cloudinaryType === "detail"
        ? "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px")

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          fill ? "absolute inset-0" : "",
          className,
        )}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center p-4">
          <div className="text-2xl mb-2">🖼️</div>
          <p className="text-sm">שגיאה בטעינת התמונה</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", fill ? "w-full h-full" : "", className)}>
      {/* Loading Animation */}
      {isLoading && showLoadingAnimation && (
        <motion.div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer",
            fill ? "" : "rounded-lg",
          )}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main Image */}
      <Image
        src={optimizedSrc || "/placeholder.svg"}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={responsiveSizes}
        placeholder={blurDataURL || generatedBlurDataURL ? placeholder : "empty"}
        blurDataURL={blurDataURL || generatedBlurDataURL}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill ? "object-cover" : "",
          `object-${objectFit}`,
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={
          !fill
            ? {
                width: "100%",
                height: "auto",
                maxWidth: width,
                maxHeight: height,
              }
            : undefined
        }
      />

      {/* Progressive Enhancement Overlay */}
      {isLoading && enableProgressiveLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      )}
    </div>
  )
}
