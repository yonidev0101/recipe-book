// התאמת קטגוריה מוצעת לקטגוריה קיימת במערכת
import type { Category } from "@/lib/types"

/**
 * מתאים שם קטגוריה מוצע (מ-GPT) לקטגוריה קיימת במערכת
 * @param suggestedCategory - שם הקטגוריה שהוצע על ידי GPT
 * @param availableCategories - רשימת הקטגוריות הקיימות במערכת
 * @returns ID של הקטגוריה המתאימה, או null אם לא נמצאה התאמה
 */
export function matchCategory(suggestedCategory: string, availableCategories: Category[]): string | null {
  const suggested = suggestedCategory.trim().toLowerCase()

  // 1. התאמה מדויקת (case-insensitive)
  const exactMatch = availableCategories.find((cat) => cat.name.trim().toLowerCase() === suggested)
  if (exactMatch) {
    return exactMatch.id
  }

  // 2. התאמה חלקית - הקטגוריה המוצעת מכילה את שם הקטגוריה הקיימת או להפך
  const fuzzyMatch = availableCategories.find(
    (cat) =>
      cat.name.trim().toLowerCase().includes(suggested) || suggested.includes(cat.name.trim().toLowerCase())
  )
  if (fuzzyMatch) {
    return fuzzyMatch.id
  }

  // 3. התאמה לפי מילות מפתח נפוצות
  const keywords: Record<string, string[]> = {
    // ניתן להוסיף mapping בין מילות מפתח לקטגוריות
    // לדוגמה: אם GPT מציע "עוגיות" והמערכת מכילה "קינוחים"
  }

  for (const cat of availableCategories) {
    const catKeywords = keywords[cat.name.toLowerCase()] || []
    if (catKeywords.some((keyword) => suggested.includes(keyword))) {
      return cat.id
    }
  }

  // 4. לא נמצאה התאמה - נחזיר null
  return null
}

/**
 * מחזיר רשימה של קטגוריות אפשריות עבור קטגוריה מוצעת
 * @param suggestedCategory - שם הקטגוריה שהוצע
 * @param availableCategories - רשימת הקטגוריות הקיימות
 * @param limit - מספר מקסימלי של הצעות להחזיר
 * @returns מערך של קטגוריות אפשריות, ממוינות לפי רלוונטיות
 */
export function suggestCategories(
  suggestedCategory: string,
  availableCategories: Category[],
  limit: number = 3
): Category[] {
  const suggested = suggestedCategory.trim().toLowerCase()

  // חישוב ציון רלוונטיות לכל קטגוריה
  const scored = availableCategories.map((cat) => {
    const catName = cat.name.trim().toLowerCase()
    let score = 0

    // התאמה מדויקת - ציון גבוה
    if (catName === suggested) {
      score = 100
    }
    // אם אחד מכיל את השני - ציון בינוני
    else if (catName.includes(suggested) || suggested.includes(catName)) {
      score = 50
    }
    // אם יש מילים משותפות - ציון נמוך
    else {
      const suggestedWords = suggested.split(" ")
      const catWords = catName.split(" ")
      const commonWords = suggestedWords.filter((word) => catWords.includes(word))
      score = commonWords.length * 10
    }

    return { category: cat, score }
  })

  // מיון לפי ציון ולקיחת Top N
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.category)
}
