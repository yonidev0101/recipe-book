// API Route לפענוח טקסט מתכון עם GPT-4
import { NextRequest, NextResponse } from "next/server"
import { parseRecipeText } from "@/lib/ai-recipe-import/openai-client"

export async function POST(request: NextRequest) {
  try {
    // פענוח ה-body
    const body = await request.json()

    // ולידציה של הקלט
    if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
      return NextResponse.json({ success: false, error: "טקסט המתכון חסר או ריק" }, { status: 400 })
    }

    if (body.text.length > 10000) {
      return NextResponse.json({ success: false, error: "הטקסט ארוך מדי (מקסימום 10,000 תווים)" }, { status: 400 })
    }

    if (!Array.isArray(body.existingCategories) || body.existingCategories.length === 0) {
      return NextResponse.json({ success: false, error: "רשימת הקטגוריות חסרה" }, { status: 400 })
    }

    // קריאה ל-OpenAI לפענוח המתכון
    const parsedRecipe = await parseRecipeText(body.text, body.existingCategories)

    // החזר את התוצאה
    return NextResponse.json({
      success: true,
      data: parsedRecipe,
    })
  } catch (error) {
    console.error("Error in parse-text API route:", error)

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
      return NextResponse.json({ success: false, error: "שגיאה בניתוח המתכון. אנא נסה שוב" }, { status: 500 })
    }

    // שגיאה לא צפויה
    return NextResponse.json({ success: false, error: "שגיאה לא צפויה. אנא נסה שוב מאוחר יותר" }, { status: 500 })
  }
}
