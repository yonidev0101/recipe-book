// API Route לפענוח תמונת מתכון עם GPT-4 Vision
import { NextRequest, NextResponse } from "next/server"
import { parseRecipeImage } from "@/lib/ai-recipe-import/openai-client"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    // פענוח FormData
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    const categoriesJson = formData.get("existingCategories") as string | null

    // ולידציה של הקלט
    if (!imageFile) {
      return NextResponse.json({ success: false, error: "קובץ התמונה חסר" }, { status: 400 })
    }

    if (!categoriesJson) {
      return NextResponse.json({ success: false, error: "רשימת הקטגוריות חסרה" }, { status: 400 })
    }

    // פענוח רשימת הקטגוריות
    let categories: string[]
    try {
      categories = JSON.parse(categoriesJson)
      if (!Array.isArray(categories) || categories.length === 0) {
        throw new Error("Invalid categories")
      }
    } catch {
      return NextResponse.json({ success: false, error: "רשימת הקטגוריות לא תקינה" }, { status: 400 })
    }

    // בדיקת סוג הקובץ
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "פורמט התמונה לא נתמך. אנא העלה תמונה בפורמט JPG, PNG או WebP",
        },
        { status: 400 }
      )
    }

    // בדיקת גודל הקובץ (20MB)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "התמונה גדולה מדי. הגודל המקסימלי הוא 20MB",
        },
        { status: 400 }
      )
    }

    // העלאה ל-Cloudinary
    let imageUrl: string
    try {
      imageUrl = await uploadToCloudinary(imageFile)
    } catch (error) {
      console.error("Cloudinary upload error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "שגיאה בהעלאת התמונה. אנא נסה שוב",
        },
        { status: 500 }
      )
    }

    // קריאה ל-OpenAI Vision לפענוח התמונה
    const parsedRecipe = await parseRecipeImage(imageUrl, categories)

    // החזר את התוצאה כולל URL התמונה
    return NextResponse.json({
      success: true,
      data: parsedRecipe,
      imageUrl: imageUrl,
    })
  } catch (error) {
    console.error("Error in parse-image API route:", error)

    // טיפול בשגיאות ידועות
    if (error instanceof Error) {
      // שגיאות OpenAI או ולידציה
      if (error.message.includes("OpenAI") || error.message.includes("חרגנו") || error.message.includes("אימות")) {
        return NextResponse.json({ success: false, error: error.message }, { status: 502 })
      }

      // שגיאות ולידציה
      if (error.message.includes("המתכון המפוענח")) {
        return NextResponse.json({ success: false, error: error.message }, { status: 422 })
      }

      // שגיאה כללית
      return NextResponse.json(
        {
          success: false,
          error: "שגיאה בניתוח התמונה. אנא נסה שוב",
        },
        { status: 500 }
      )
    }

    // שגיאה לא צפויה
    return NextResponse.json(
      {
        success: false,
        error: "שגיאה לא צפויה. אנא נסה שוב מאוחר יותר",
      },
      { status: 500 }
    )
  }
}
