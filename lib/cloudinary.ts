"use server"

import { v2 as cloudinary } from "cloudinary"

// בסביבת פיתוח בלבד - השבת בדיקת SSL
// זה נדרש כאשר יש proxy/firewall עם self-signed certificates
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

// קונפיגורציה של Cloudinary - נעשית בכל קריאה לפונקציה כדי לוודא שמשתני הסביבה נטענים
function configureCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary environment variables:", {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
    })
    throw new Error("Missing Cloudinary environment variables")
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  return cloudinary
}

// פונקציה להעלאת תמונה ל-Cloudinary
export async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    // וידוא שהקונפיגורציה נטענה
    const cloudinaryInstance = configureCloudinary()

    // המרת הקובץ ל-ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // העלאת התמונה ל-Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryInstance.uploader.upload_stream(
        {
          folder: "recipe-images",
          resource_type: "auto",
          // אפשרויות נוספות כמו שינוי גודל, קיצוץ וכו'
          transformation: [
            { width: 1200, crop: "limit" }, // הגבלת רוחב מקסימלי
            { quality: "auto" }, // אופטימיזציה אוטומטית של איכות
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(error)
          } else {
            resolve(result?.secure_url || null)
          }
        },
      )

      // העברת הנתונים לסטרים
      uploadStream.write(buffer)
      uploadStream.end()
    })
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    return null
  }
}

// פונקציה למחיקת תמונה מ-Cloudinary
export async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    // וידוא שהקונפיגורציה נטענה
    const cloudinaryInstance = configureCloudinary()

    // חילוץ ה-public_id מה-URL
    const publicId = extractPublicIdFromUrl(url)

    if (!publicId) return false

    // מחיקת התמונה מ-Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinaryInstance.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return false
  }
}

// פונקציית עזר לחילוץ ה-public_id מ-URL של Cloudinary
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // דוגמה ל-URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/recipe-images/abcdef.jpg
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")

    // מחפשים את החלק שאחרי "upload" ומסירים את הסיומת
    const uploadIndex = pathParts.findIndex((part) => part === "upload")
    if (uploadIndex === -1) return null

    // מחברים את כל החלקים אחרי "upload" חוץ מהאחרון (שהוא שם הקובץ עם סיומת)
    const folderPath = pathParts.slice(uploadIndex + 1, -1).join("/")
    const fileName = pathParts[pathParts.length - 1].split(".")[0]

    return `${folderPath}/${fileName}`
  } catch (error) {
    console.error("Error extracting public ID from URL:", error)
    return null
  }
}
