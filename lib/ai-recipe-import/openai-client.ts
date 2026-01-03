// OpenAI Client Wrapper לפענוח מתכונים
import OpenAI from "openai"
import { SYSTEM_PROMPT_TEXT, SYSTEM_PROMPT_IMAGE, buildUserPromptForText, buildUserPromptForImage } from "./prompts"
import { validateParsedRecipe, type ParsedRecipe } from "./schema"

// יצירת OpenAI client (singleton)
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY לא הוגדר במשתני הסביבה")
    }

    openaiClient = new OpenAI({
      apiKey,
    })
  }

  return openaiClient
}

/**
 * פענוח טקסט מתכון באמצעות GPT-4
 */
export async function parseRecipeText(text: string, categories: string[]): Promise<ParsedRecipe> {
  const openai = getOpenAIClient()

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o - מודל חזק ומדויק
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_TEXT,
        },
        {
          role: "user",
          content: buildUserPromptForText(text, categories),
        },
      ],
      temperature: 0.2, // נמוך מאוד להבטחת דיוק ועקביות
      response_format: { type: "json_object" }, // אכיפת JSON response
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("לא התקבלה תשובה מ-OpenAI")
    }

    // פענוח ה-JSON
    const parsed = JSON.parse(content)

    // ולידציה
    const validated = validateParsedRecipe(parsed)

    return validated
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error("חרגנו ממכסת הבקשות. נסה שוב בעוד מספר רגעים")
      }
      if (error.status === 401) {
        throw new Error("בעיית אימות עם OpenAI - בדוק את ה-API Key")
      }
      throw new Error(`שגיאה בשירות OpenAI: ${error.message}`)
    }

    if (error instanceof SyntaxError) {
      throw new Error("התשובה מ-OpenAI אינה JSON תקין")
    }

    throw error
  }
}

/**
 * פענוח תמונת מתכון באמצעות GPT-4 Vision
 */
export async function parseRecipeImage(imageUrl: string, categories: string[]): Promise<ParsedRecipe> {
  const openai = getOpenAIClient()

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o - הכי טוב ל-vision + דיוק
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_IMAGE,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildUserPromptForImage(categories),
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high", // רזולוציה גבוהה לקריאת טקסט מדויקת
              },
            },
          ],
        },
      ],
      temperature: 0.1, // מאוד נמוך - מקסימום דיוק, מינימום המצאות
      response_format: { type: "json_object" },
      max_tokens: 2500, // מספיק למתכון מפורט
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("לא התקבלה תשובה מ-OpenAI Vision")
    }

    // פענוח ה-JSON
    const parsed = JSON.parse(content)

    // ולידציה
    const validated = validateParsedRecipe(parsed)

    return validated
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error("חרגנו ממכסת הבקשות. נסה שוב בעוד מספר רגעים")
      }
      if (error.status === 401) {
        throw new Error("בעיית אימות עם OpenAI - בדוק את ה-API Key")
      }
      throw new Error(`שגיאה בשירות OpenAI Vision: ${error.message}`)
    }

    if (error instanceof SyntaxError) {
      throw new Error("התשובה מ-OpenAI Vision אינה JSON תקין")
    }

    throw error
  }
}
