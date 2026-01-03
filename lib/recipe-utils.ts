// טיפוסים לייצוג מרכיב מנותח
export interface ParsedIngredient {
  originalText: string // הטקסט המקורי של המרכיב
  quantity: number | null // הכמות המספרית
  unit: string | null // יחידת המידה
  name: string // שם המרכיב
  hasQuantity: boolean // האם יש כמות מספרית
}

// רשימת יחידות מידה נפוצות בעברית
const hebrewUnits = [
  "כוס",
  "כוסות",
  "כף",
  "כפות",
  "כפית",
  "כפיות",
  "גרם",
  'ק"ג',
  "קילו",
  "קילוגרם",
  'מ"ל',
  "ליטר",
  "ל'",
  "יחידה",
  "יחידות",
  "חבילה",
  "חבילות",
  "קופסה",
  "קופסאות",
  "פרוסה",
  "פרוסות",
  "כוסית",
  "כוסיות",
  "חתיכה",
  "חתיכות",
  "מעט",
  "קצת",
  "מעט מאוד",
  "שן",
  "שיני",
  "עלה",
  "עלי",
  "קורט",
  "קורטוב",
  "מיכל",
  "מיכלים",
  "שקית",
  "שקיות",
  "בקבוק",
  "בקבוקים",
  "פחית",
  "פחיות",
  "צרור",
  "צרורות",
  "ענף",
  "ענפים",
  "מקל",
  "מקלות",
  "ראש",
  "ראשים",
  "פרי",
  "פירות",
  "ביצה",
  "ביצים",
  "מ״ל",
  "ק״ג",
]

// ביטוי רגולרי לזיהוי מספרים (כולל שברים ומספרים עשרוניים)
const numberRegex = /^(\d+(\.\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)/

/**
 * המרת שבר מחרוזת למספר עשרוני
 */
export function fractionToDecimal(fraction: string): number {
  // בדיקה אם זה מספר מעורב (שלם + שבר)
  if (fraction.includes(" ")) {
    const [whole, frac] = fraction.split(" ")
    return Number.parseInt(whole) + fractionToDecimal(frac)
  }

  // בדיקה אם זה שבר רגיל
  if (fraction.includes("/")) {
    const [numerator, denominator] = fraction.split("/").map(Number)
    return numerator / denominator
  }

  // אחרת זה כבר מספר עשרוני או שלם
  return Number.parseFloat(fraction)
}

/**
 * ניתוח מחרוזת מרכיב לחלקים: כמות, יחידה ושם
 */
export function parseIngredient(ingredientText: string): ParsedIngredient {
  // הסרת רווחים מיותרים
  const text = ingredientText.trim()

  // אם הטקסט ריק, החזר אובייקט ריק
  if (!text) {
    return {
      originalText: text,
      quantity: null,
      unit: null,
      name: text,
      hasQuantity: false,
    }
  }

  // פיצול הטקסט למילים
  const words = text.split(/\s+/)

  // בדיקה אם המילה הראשונה היא מספר
  let quantityText = ""
  let startIndex = 0
  let quantity: number | null = null
  let hasQuantity = false

  const firstWordMatch = words[0].match(numberRegex)
  if (firstWordMatch) {
    quantityText = firstWordMatch[0]
    quantity = fractionToDecimal(quantityText)
    startIndex = 1
    hasQuantity = true
  }

  // בדיקה אם המילה השנייה היא יחידת מידה
  let unit: string | null = null
  let nameStartIndex = startIndex

  if (startIndex < words.length && hebrewUnits.includes(words[startIndex])) {
    unit = words[startIndex]
    nameStartIndex = startIndex + 1
  }

  // שאר המילים הן שם המרכיב
  const name = words.slice(nameStartIndex).join(" ")

  return {
    originalText: text,
    quantity,
    unit,
    name,
    hasQuantity,
  }
}

/**
 * התאמת כמות המרכיב למספר המנות החדש
 */
export function adjustIngredientQuantity(
  ingredient: ParsedIngredient,
  originalServings: number,
  newServings: number,
): string {
  // אם אין כמות, החזר את הטקסט המקורי
  if (!ingredient.hasQuantity || ingredient.quantity === null) {
    return ingredient.originalText
  }

  // חישוב הכמות החדשה
  const ratio = newServings / originalServings
  const newQuantity = ingredient.quantity * ratio

  // עיגול הכמות החדשה לדיוק מתאים
  let formattedQuantity: string

  if (Number.isInteger(newQuantity)) {
    // אם זה מספר שלם, הצג אותו ללא ספרות עשרוניות
    formattedQuantity = newQuantity.toString()
  } else if (newQuantity < 0.1) {
    // אם זה מספר קטן מאוד, הצג עד 2 ספרות עשרוניות
    formattedQuantity = newQuantity.toFixed(2)
  } else if (newQuantity < 1) {
    // אם זה שבר, הצג עד ספרה עשרונית אחת
    formattedQuantity = newQuantity.toFixed(1)
  } else {
    // אחרת, הצג עד ספרה עשרונית אחת
    formattedQuantity = newQuantity.toFixed(1)
    // הסר את הספרה העשרונית אם היא 0
    if (formattedQuantity.endsWith(".0")) {
      formattedQuantity = formattedQuantity.slice(0, -2)
    }
  }

  // בניית המחרוזת החדשה
  if (ingredient.unit) {
    return `${formattedQuantity} ${ingredient.unit} ${ingredient.name}`
  } else {
    return `${formattedQuantity} ${ingredient.name}`
  }
}

/**
 * התאמת כל המרכיבים למספר המנות החדש
 */
export function adjustAllIngredients(ingredients: string[], originalServings: number, newServings: number): string[] {
  return ingredients.map((ingredient) => {
    const parsed = parseIngredient(ingredient)
    return adjustIngredientQuantity(parsed, originalServings, newServings)
  })
}
