// סכימת נתונים לייבוא מתכונים עם AI

export interface ParsedRecipe {
  title: string
  description: string
  categoryName: string // שם הקטגוריה (לא ID - נתאים אותו אחר כך)
  prepTime: number // זמן הכנה בדקות
  servings: number // מספר מנות
  difficulty: "קל" | "בינוני" | "מורכב"
  ingredients: string[]
  instructions: string[]
  tips?: string[]
}

// ולידציה של המתכון המפוענח
export function validateParsedRecipe(data: any): ParsedRecipe {
  const errors: string[] = []

  // בדיקת כותרת
  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    errors.push("כותרת המתכון חסרה או לא תקינה")
  }

  // בדיקת תיאור
  if (!data.description || typeof data.description !== "string") {
    errors.push("תיאור המתכון חסר או לא תקין")
  }

  // בדיקת קטגוריה
  if (!data.categoryName || typeof data.categoryName !== "string" || data.categoryName.trim() === "") {
    errors.push("קטגוריית המתכון חסרה או לא תקינה")
  }

  // בדיקת זמן הכנה
  if (!data.prepTime || typeof data.prepTime !== "number" || data.prepTime <= 0) {
    errors.push("זמן ההכנה חסר או לא תקין")
  }

  // בדיקת מספר מנות
  if (!data.servings || typeof data.servings !== "number" || data.servings <= 0) {
    errors.push("מספר המנות חסר או לא תקין")
  }

  // בדיקת רמת קושי
  const validDifficulties = ["קל", "בינוני", "מורכב"]
  if (!data.difficulty || !validDifficulties.includes(data.difficulty)) {
    errors.push('רמת הקושי חייבת להיות אחת מהאפשרויות: "קל", "בינוני", "מורכב"')
  }

  // בדיקת מרכיבים
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    errors.push("רשימת המרכיבים חסרה או ריקה")
  } else {
    // בדוק שכל מרכיב הוא string לא ריק
    const invalidIngredients = data.ingredients.some((ing: any) => typeof ing !== "string" || ing.trim() === "")
    if (invalidIngredients) {
      errors.push("אחד או יותר מהמרכיבים לא תקינים")
    }
  }

  // בדיקת הוראות
  if (!Array.isArray(data.instructions) || data.instructions.length === 0) {
    errors.push("הוראות ההכנה חסרות או ריקות")
  } else {
    const invalidInstructions = data.instructions.some((inst: any) => typeof inst !== "string" || inst.trim() === "")
    if (invalidInstructions) {
      errors.push("אחת או יותר מהוראות ההכנה לא תקינות")
    }
  }

  // בדיקת טיפים (אופציונלי)
  if (data.tips !== undefined) {
    if (!Array.isArray(data.tips)) {
      errors.push("רשימת הטיפים חייבת להיות מערך")
    } else {
      const invalidTips = data.tips.some((tip: any) => typeof tip !== "string" || tip.trim() === "")
      if (invalidTips) {
        errors.push("אחד או יותר מהטיפים לא תקינים")
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`המתכון המפוענח אינו תקין:\n${errors.join("\n")}`)
  }

  return data as ParsedRecipe
}
