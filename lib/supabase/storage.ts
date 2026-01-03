import { createServerClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// פונקציה להעלאת תמונה ל-Supabase Storage
export async function uploadImage(file: File): Promise<string | null> {
  try {
    const supabase = createServerClient()

    // יצירת שם קובץ ייחודי עם UUID
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `recipe-images/${fileName}`

    // העלאת הקובץ ל-Storage עם גודל מקסימלי מוגדל
    const { data, error } = await supabase.storage.from("images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      console.error("Error uploading image:", error)
      return null
    }

    // קבלת URL ציבורי לתמונה
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error in uploadImage:", error)
    return null
  }
}

// פונקציה למחיקת תמונה מ-Supabase Storage
export async function deleteImage(url: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    // חילוץ נתיב הקובץ מה-URL
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split("/")
    const bucketName = pathSegments[1] // בדרך כלל "images"
    const filePath = pathSegments.slice(2).join("/") // נתיב הקובץ בתוך ה-bucket

    const { error } = await supabase.storage.from(bucketName).remove([filePath])

    if (error) {
      console.error("Error deleting image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteImage:", error)
    return false
  }
}
