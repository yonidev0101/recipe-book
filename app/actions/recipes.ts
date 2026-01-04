"use server"

import { createServerClient, getCurrentUser } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { RecipeFormData } from "@/lib/types"
import { deleteFromCloudinary } from "@/lib/cloudinary"
import { v2 as cloudinary } from "cloudinary"

// פעולה לקבלת כל המתכונים
export async function getRecipes(categoryId?: string, searchQuery?: string) {
  const supabase = createServerClient()

  let query = supabase
    .from("recipes")
    .select(`
      *,
      categories(name),
      ingredients(text, order_num),
      instructions(text, order_num),
      tips(text, order_num),
      recipe_tags(tag_id, tags(name))
    `)
    .order("created_at", { ascending: false })

  // סינון לפי קטגוריה אם צוינה
  if (categoryId && categoryId !== "all") {
    query = query.eq("category_id", categoryId)
  }

  let data

  // סינון לפי מחרוזת חיפוש אם צוינה
  if (searchQuery && searchQuery.trim() !== "") {
    const searchTerm = searchQuery.trim().toLowerCase()

    // חיפוש במתכונים עצמם
    const { data: recipeResults } = await supabase
      .from("recipes")
      .select(`
        *,
        categories(name),
        ingredients(text, order_num),
        instructions(text, order_num),
        tips(text, order_num),
        recipe_tags(tag_id, tags(name))
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order("created_at", { ascending: false })

    // חיפוש במרכיבים
    const { data: ingredientResults } = await supabase
      .from("ingredients")
      .select(`
        recipe_id,
        recipes(
          *,
          categories(name),
          ingredients(text, order_num),
          instructions(text, order_num),
          tips(text, order_num),
          recipe_tags(tag_id, tags(name))
        )
      `)
      .ilike("text", `%${searchTerm}%`)

    // חיפוש בהוראות
    const { data: instructionResults } = await supabase
      .from("instructions")
      .select(`
        recipe_id,
        recipes(
          *,
          categories(name),
          ingredients(text, order_num),
          instructions(text, order_num),
          tips(text, order_num),
          recipe_tags(tag_id, tags(name))
        )
      `)
      .ilike("text", `%${searchTerm}%`)

    // חיפוש בטיפים
    const { data: tipResults } = await supabase
      .from("tips")
      .select(`
        recipe_id,
        recipes(
          *,
          categories(name),
          ingredients(text, order_num),
          instructions(text, order_num),
          tips(text, order_num),
          recipe_tags(tag_id, tags(name))
        )
      `)
      .ilike("text", `%${searchTerm}%`)

    // חיפוש בתגיות
    const { data: tagResults } = await supabase
      .from("tags")
      .select(`
        recipe_tags(
          recipe_id,
          recipes(
            *,
            categories(name),
            ingredients(text, order_num),
            instructions(text, order_num),
            tips(text, order_num),
            recipe_tags(tag_id, tags(name))
          )
        )
      `)
      .ilike("name", `%${searchTerm}%`)

    // איחוד כל התוצאות
    const allResults = new Map()

    // הוספת תוצאות מתכונים
    recipeResults?.forEach((recipe) => {
      allResults.set(recipe.id, recipe)
    })

    // הוספת תוצאות מרכיבים
    ingredientResults?.forEach((item) => {
      if (item.recipes) {
        allResults.set(item.recipes.id, item.recipes)
      }
    })

    // הוספת תוצאות הוראות
    instructionResults?.forEach((item) => {
      if (item.recipes) {
        allResults.set(item.recipes.id, item.recipes)
      }
    })

    // הוספת תוצאות טיפים
    tipResults?.forEach((item) => {
      if (item.recipes) {
        allResults.set(item.recipes.id, item.recipes)
      }
    })

    // הוספת תוצאות תגיות
    tagResults?.forEach((tag) => {
      tag.recipe_tags?.forEach((recipeTag) => {
        if (recipeTag.recipes) {
          allResults.set(recipeTag.recipes.id, recipeTag.recipes)
        }
      })
    })

    data = Array.from(allResults.values())
  } else {
    const { data: allData, error } = await query
    if (error) {
      console.error("Error fetching recipes:", error)
      return []
    }
    data = allData
  }

  if (!data) {
    return []
  }

  // עיבוד הנתונים לפורמט הנדרש
  return data.map((recipe) => {
    const ingredients = recipe.ingredients.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const instructions = recipe.instructions.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const tips = recipe.tips.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const tags = recipe.recipe_tags.map((rt) => rt.tags.name)

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.categories?.name || "ללא קטגוריה",
      categoryId: recipe.category_id,
      tags,
      prepTime: recipe.prep_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients,
      instructions,
      tips,
      image: recipe.image || "/placeholder.svg?height=300&width=400",
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    }
  })
}

// פעולה לקבלת מתכון בודד לפי מזהה
export async function getRecipeById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      categories(name),
      ingredients(text, order_num),
      instructions(text, order_num),
      tips(text, order_num),
      recipe_tags(tag_id, tags(name))
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching recipe:", error)
    return null
  }

  // עיבוד הנתונים לפורמט הנדרש
  const ingredients = data.ingredients.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
  const instructions = data.instructions.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
  const tips = data.tips.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
  const tags = data.recipe_tags.map((rt) => rt.tags.name)

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.categories?.name || "ללא קטגוריה",
    categoryId: data.category_id,
    tags,
    prepTime: data.prep_time,
    servings: data.servings,
    difficulty: data.difficulty,
    ingredients,
    instructions,
    tips,
    image: data.image || "/placeholder.svg?height=300&width=400",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// פעולה להעלאת תמונה
export async function uploadRecipeImage(formData: FormData) {
  try {
    const file = formData.get("image") as File

    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" }
    }

    // בדיקה שהקובץ הוא תמונה
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/svg+xml",
    ]

    if (!validImageTypes.includes(file.type)) {
      return { success: false, error: "File is not a supported image format" }
    }

    // הגבלת גודל הקובץ (20MB)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return { success: false, error: "File size exceeds 20MB" }
    }

    // קונפיגורציה של Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Missing Cloudinary environment variables")
      return { success: false, error: "Missing Cloudinary configuration" }
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })

    // המרת הקובץ ל-ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // העלאת התמונה ל-Cloudinary
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "recipe-images",
          resource_type: "auto",
          upload_preset: "recipe_images", // שם ה-upload preset שהגדרת ב-Cloudinary
          transformation: [
            { width: 1200, crop: "limit" }, // הגבלת רוחב מקסימלי
            { quality: "auto" }, // אופטימיזציה אוטומטית של איכות
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            resolve({ success: false, error: "Error uploading to Cloudinary" })
          } else {
            resolve({ success: true, imageUrl: result?.secure_url })
          }
        },
      )

      // העברת הנתונים לסטרים
      uploadStream.write(buffer)
      uploadStream.end()
    })
  } catch (error) {
    console.error("Error in uploadRecipeImage:", error)
    return { success: false, error: "An error occurred while uploading the image" }
  }
}

// פעולה ליצירת מתכון חדש
export async function createRecipe(formData: RecipeFormData) {
  const supabase = createServerClient()
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "יש להתחבר כדי ליצור מתכון" }
  }

  // יצירת המתכון הבסיסי
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      title: formData.title,
      description: formData.description,
      category_id: formData.categoryId,
      prep_time: formData.prepTime,
      servings: formData.servings,
      difficulty: formData.difficulty,
      image: formData.image || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (recipeError) {
    console.error("Error creating recipe:", recipeError)
    return { success: false, error: recipeError.message }
  }

  // הוספת המרכיבים
  const ingredientsToInsert = formData.ingredients
    .filter((text) => text.trim() !== "")
    .map((text, index) => ({
      recipe_id: recipe.id,
      text,
      order_num: index,
    }))

  if (ingredientsToInsert.length > 0) {
    const { error: ingredientsError } = await supabase.from("ingredients").insert(ingredientsToInsert)

    if (ingredientsError) {
      console.error("Error adding ingredients:", ingredientsError)
    }
  }

  // הוספת הוראות ההכנה
  const instructionsToInsert = formData.instructions
    .filter((text) => text.trim() !== "")
    .map((text, index) => ({
      recipe_id: recipe.id,
      text,
      order_num: index,
    }))

  if (instructionsToInsert.length > 0) {
    const { error: instructionsError } = await supabase.from("instructions").insert(instructionsToInsert)

    if (instructionsError) {
      console.error("Error adding instructions:", instructionsError)
    }
  }

  // הוספת טיפים
  const tipsToInsert = formData.tips
    .filter((text) => text.trim() !== "")
    .map((text, index) => ({
      recipe_id: recipe.id,
      text,
      order_num: index,
    }))

  if (tipsToInsert.length > 0) {
    const { error: tipsError } = await supabase.from("tips").insert(tipsToInsert)

    if (tipsError) {
      console.error("Error adding tips:", tipsError)
    }
  }

  revalidatePath("/")
  return { success: true, id: recipe.id }
}

// פעולה לעדכון מתכון קיים
export async function updateRecipe(id: string, formData: RecipeFormData) {
  const supabase = createServerClient()
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "יש להתחבר כדי לעדכן מתכון" }
  }

  try {
    // בדיקה שהמשתמש הוא בעל המתכון
    const { data: existingRecipe } = await supabase.from("recipes").select("image, user_id").eq("id", id).single()

    if (existingRecipe?.user_id && existingRecipe.user_id !== user.id) {
      return { success: false, error: "אין לך הרשאה לעדכן מתכון זה" }
    }

    if (existingRecipe?.image && formData.image && existingRecipe.image !== formData.image) {
      // מחיקת התמונה הישנה רק אם היא לא תמונת ברירת מחדל
      if (!existingRecipe.image.includes("placeholder.svg")) {
        try {
          // מחיקת התמונה מ-Cloudinary במקום מ-Supabase
          await deleteFromCloudinary(existingRecipe.image)
        } catch (error) {
          console.error("Error deleting old image, continuing with recipe update:", error)
          // ממשיכים לעדכן את המתכון גם אם מחיקת התמונה הישנה נכשלה
        }
      }
    }

    // עדכון המתכון הבסיסי
    const { error: recipeError } = await supabase
      .from("recipes")
      .update({
        title: formData.title,
        description: formData.description,
        category_id: formData.categoryId,
        prep_time: formData.prepTime,
        servings: formData.servings,
        difficulty: formData.difficulty,
        image: formData.image || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (recipeError) {
      console.error("Error updating recipe:", recipeError)
      return { success: false, error: recipeError.message }
    }

    // מחיקת המרכיבים הקיימים
    await supabase.from("ingredients").delete().eq("recipe_id", id)

    // הוספת המרכיבים החדשים
    const ingredientsToInsert = formData.ingredients
      .filter((text) => text.trim() !== "")
      .map((text, index) => ({
        recipe_id: id,
        text,
        order_num: index,
      }))

    if (ingredientsToInsert.length > 0) {
      const { error: ingredientsError } = await supabase.from("ingredients").insert(ingredientsToInsert)

      if (ingredientsError) {
        console.error("Error updating ingredients:", ingredientsError)
      }
    }

    // מחיקת הוראות ההכנה הקיימות
    await supabase.from("instructions").delete().eq("recipe_id", id)

    // הוספת הוראות ההכנה החדשות
    const instructionsToInsert = formData.instructions
      .filter((text) => text.trim() !== "")
      .map((text, index) => ({
        recipe_id: id,
        text,
        order_num: index,
      }))

    if (instructionsToInsert.length > 0) {
      const { error: instructionsError } = await supabase.from("instructions").insert(instructionsToInsert)

      if (instructionsError) {
        console.error("Error updating instructions:", instructionsError)
      }
    }

    // מחיקת הטיפים הקיימים
    await supabase.from("tips").delete().eq("recipe_id", id)

    // הוספת הטיפים החדשים
    const tipsToInsert = formData.tips
      .filter((text) => text.trim() !== "")
      .map((text, index) => ({
        recipe_id: id,
        text,
        order_num: index,
      }))

    if (tipsToInsert.length > 0) {
      const { error: tipsError } = await supabase.from("tips").insert(tipsToInsert)

      if (tipsError) {
        console.error("Error updating tips:", tipsError)
      }
    }

    revalidatePath(`/recipes/${id}`)
    revalidatePath("/")
    return { success: true, id }
  } catch (error) {
    console.error("Error in updateRecipe:", error)
    return { success: false, error: "אירעה שגיאה בעת עדכון המתכון" }
  }
}

// פעולה למחיקת מתכון
export async function deleteRecipe(id: string) {
  const supabase = createServerClient()
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "יש להתחבר כדי למחוק מתכון" }
  }

  try {
    // קבלת פרטי המתכון לפני המחיקה כדי למחוק את התמונה
    const { data: recipe } = await supabase.from("recipes").select("image, user_id").eq("id", id).single()

    // בדיקה שהמשתמש הוא בעל המתכון
    if (recipe?.user_id && recipe.user_id !== user.id) {
      return { success: false, error: "אין לך הרשאה למחוק מתכון זה" }
    }

    // מחיקת התמונה אם קיימת ואינה תמונת ברירת מחדל
    if (recipe?.image && !recipe.image.includes("placeholder.svg")) {
      try {
        // מחיקת התמונה מ-Cloudinary במקום מ-Supabase
        await deleteFromCloudinary(recipe.image)
      } catch (error) {
        console.error("Error deleting image, continuing with recipe deletion:", error)
        // ממשיכים למחוק את המתכון גם אם מחיקת התמונה נכשלה
      }
    }

    const { error } = await supabase.from("recipes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting recipe:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteRecipe:", error)
    return { success: false, error: "אירעה שגיאה בעת מחיקת המתכון" }
  }
}

// פעולה לקבלת המתכונים של המשתמש הנוכחי
export async function getMyRecipes() {
  const supabase = createServerClient()
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      categories(name),
      ingredients(text, order_num),
      instructions(text, order_num),
      tips(text, order_num),
      recipe_tags(tag_id, tags(name))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user recipes:", error)
    return []
  }

  return data.map((recipe) => {
    const ingredients = recipe.ingredients.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const instructions = recipe.instructions.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const tips = recipe.tips.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const tags = recipe.recipe_tags.map((rt) => rt.tags.name)

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.categories?.name || "ללא קטגוריה",
      categoryId: recipe.category_id,
      tags,
      prepTime: recipe.prep_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients,
      instructions,
      tips,
      image: recipe.image || "/placeholder.svg?height=300&width=400",
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    }
  })
}

// בדיקה אם המשתמש הנוכחי הוא בעל המתכון
export async function isRecipeOwner(recipeId: string) {
  const supabase = createServerClient()
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from("recipes")
    .select("user_id")
    .eq("id", recipeId)
    .single()

  return data?.user_id === user.id
}

// פעולה לקבלת כל הקטגוריות
export async function getCategories() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data
}

// פעולה ליצירת קטגוריה חדשה
export async function createCategory(name: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("categories").insert({ name }).select().single()

  if (error) {
    console.error("Error creating category:", error)
    return null
  }

  return data
}

// פעולה להוספת מתכון למועדפים
export async function toggleFavorite(recipeId: string, userId: string | null = null) {
  const supabase = createServerClient()

  // אם אין משתמש מזוהה, נשמור את המועדפים ב-localStorage בצד הלקוח
  if (!userId) {
    return { success: true, isFavorite: true, clientSideOnly: true }
  }

  // בדיקה אם המתכון כבר במועדפים
  const { data: existingFavorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existingFavorite) {
    // הסרה מהמועדפים
    const { error } = await supabase.from("favorites").delete().eq("id", existingFavorite.id)

    if (error) {
      console.error("Error removing from favorites:", error)
      return { success: false, error: error.message }
    }

    return { success: true, isFavorite: false }
  } else {
    // הוספה למועדפים
    const { error } = await supabase.from("favorites").insert({
      recipe_id: recipeId,
      user_id: userId,
    })

    if (error) {
      console.error("Error adding to favorites:", error)
      return { success: false, error: error.message }
    }

    return { success: true, isFavorite: true }
  }
}

// פעולה לקבלת המתכונים המועדפים
export async function getFavoriteRecipes(userId: string | null = null) {
  const supabase = createServerClient()

  // אם אין משתמש מזוהה, נחזיר רשימה ריקה
  // בצד הלקוח נטפל במועדפים באמצעות localStorage
  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      recipe_id,
      recipes(
        *,
        categories(name),
        ingredients(text, order_num),
        instructions(text, order_num),
        tips(text, order_num),
        recipe_tags(tag_id, tags(name))
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching favorite recipes:", error)
    return []
  }

  // עיבוד הנתונים לפורמט הנדרש
  return data.map((favorite) => {
    const recipe = favorite.recipes
    const ingredients = recipe.ingredients.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const instructions = recipe.instructions.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const tips = recipe.tips.sort((a, b) => a.order_num - b.order_num).map((i) => i.text)
    const tags = recipe.recipe_tags.map((rt) => rt.tags.name)

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.categories?.name || "ללא קטגוריה",
      categoryId: recipe.category_id,
      tags,
      prepTime: recipe.prep_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients,
      instructions,
      tips,
      image: recipe.image || "/placeholder.svg?height=300&width=400",
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    }
  })
}

// פעולה לבדיקה אם מתכון נמצא במועדפים
export async function isFavorite(recipeId: string, userId: string | null = null) {
  // אם אין משתמש מזוהה, נחזיר false
  // בצד הלקוח נבדוק את המועדפים ב-localStorage
  if (!userId) {
    return false
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error checking favorite status:", error)
    return false
  }

  return !!data
}
