"use client"

interface CloudinaryTransformation {
  width?: number
  height?: number
  quality?: string | number
  format?: string
  crop?: string
  gravity?: string
  fetchFormat?: string
  dpr?: string | number
  flags?: string
  effect?: string
  overlay?: string
  background?: string
}

interface ResponsiveSize {
  breakpoint: string
  width: number
  height?: number
}

export class CloudinaryOptimizer {
  private cloudName: string
  private baseUrl: string

  constructor(cloudName?: string) {
    this.cloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "doxhxgwwq"
    this.baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`
  }

  /**
   * בניית URL מותאם עם אופטימיזציות
   */
  buildOptimizedUrl(publicId: string, transformations: CloudinaryTransformation = {}): string {
    const defaultTransformations: CloudinaryTransformation = {
      quality: "auto:good",
      fetchFormat: "auto",
      dpr: "auto",
      flags: "progressive",
      ...transformations,
    }

    const transformationString = this.buildTransformationString(defaultTransformations)
    return `${this.baseUrl}/${transformationString}/${publicId}`
  }

  /**
   * יצירת תמונות responsive עם גדלים שונים
   */
  buildResponsiveUrls(publicId: string, sizes: ResponsiveSize[], baseTransformations: CloudinaryTransformation = {}) {
    return sizes.map((size) => ({
      breakpoint: size.breakpoint,
      url: this.buildOptimizedUrl(publicId, {
        ...baseTransformations,
        width: size.width,
        height: size.height,
      }),
      width: size.width,
      height: size.height,
    }))
  }

  /**
   * יצירת placeholder מטושטש
   */
  buildBlurPlaceholder(publicId: string, width = 40): string {
    return this.buildOptimizedUrl(publicId, {
      width,
      quality: 1,
      effect: "blur:1000",
      fetchFormat: "auto",
    })
  }

  /**
   * אופטימיזציה לכרטיסי מתכונים
   */
  buildRecipeCardImage(publicId: string, size: "small" | "medium" | "large" = "medium"): string {
    const sizes = {
      small: { width: 300, height: 200 },
      medium: { width: 400, height: 300 },
      large: { width: 600, height: 400 },
    }

    const { width, height } = sizes[size]

    return this.buildOptimizedUrl(publicId, {
      width,
      height,
      crop: "fill",
      gravity: "auto",
      quality: "auto:good",
      fetchFormat: "auto",
      dpr: "auto",
    })
  }

  /**
   * אופטימיזציה לדף מתכון מלא
   */
  buildRecipeDetailImage(publicId: string): string {
    return this.buildOptimizedUrl(publicId, {
      width: 1200,
      height: 675, // 16:9 aspect ratio
      crop: "fill",
      gravity: "auto",
      quality: "auto:best",
      fetchFormat: "auto",
      dpr: "auto",
      flags: "progressive",
    })
  }

  /**
   * אופטימיזציה לתמונות hero
   */
  buildHeroImage(publicId: string): string {
    return this.buildOptimizedUrl(publicId, {
      width: 1920,
      height: 1080,
      crop: "fill",
      gravity: "auto",
      quality: "auto:best",
      fetchFormat: "auto",
      dpr: "auto",
      flags: "progressive",
      effect: "sharpen:100",
    })
  }

  /**
   * אופטימיזציה לתמונות thumbnail
   */
  buildThumbnail(publicId: string, size = 150): string {
    return this.buildOptimizedUrl(publicId, {
      width: size,
      height: size,
      crop: "fill",
      gravity: "face",
      quality: "auto:good",
      fetchFormat: "auto",
      dpr: "auto",
    })
  }

  /**
   * בניית מחרוזת transformations
   */
  private buildTransformationString(transformations: CloudinaryTransformation): string {
    const parts: string[] = []

    Object.entries(transformations).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const transformationKey = this.mapTransformationKey(key)
        parts.push(`${transformationKey}_${value}`)
      }
    })

    return parts.join(",")
  }

  /**
   * מיפוי מפתחות transformation
   */
  private mapTransformationKey(key: string): string {
    const keyMap: Record<string, string> = {
      width: "w",
      height: "h",
      quality: "q",
      format: "f",
      crop: "c",
      gravity: "g",
      fetchFormat: "f",
      dpr: "dpr",
      flags: "fl",
      effect: "e",
      overlay: "l",
      background: "b",
    }

    return keyMap[key] || key
  }

  /**
   * חילוץ public ID מ-URL
   */
  static extractPublicId(cloudinaryUrl: string): string | null {
    try {
      const url = new URL(cloudinaryUrl)
      const pathParts = url.pathname.split("/")
      const uploadIndex = pathParts.findIndex((part) => part === "upload")

      if (uploadIndex === -1) return null

      // מחברים את כל החלקים אחרי "upload" ומסירים את הסיומת
      const pathAfterUpload = pathParts.slice(uploadIndex + 1).join("/")
      const lastDotIndex = pathAfterUpload.lastIndexOf(".")

      if (lastDotIndex === -1) return pathAfterUpload

      return pathAfterUpload.substring(0, lastDotIndex)
    } catch (error) {
      console.error("Error extracting public ID:", error)
      return null
    }
  }

  /**
   * בדיקה אם URL הוא מ-Cloudinary
   */
  static isCloudinaryUrl(url: string): boolean {
    return url.includes("res.cloudinary.com") || url.includes("cloudinary.com")
  }
}

// יצירת instance גלובלי
export const cloudinaryOptimizer = new CloudinaryOptimizer()
