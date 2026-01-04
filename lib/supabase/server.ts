import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

// יצירת קליינט Supabase לשימוש בצד השרת
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// יצירת קליינט עם תמיכה באימות מצד השרת
export async function createAuthServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const cookieStore = await cookies()
  const authToken = cookieStore.get("sb-access-token")?.value
  const refreshToken = cookieStore.get("sb-refresh-token")?.value

  const client = createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`,
      } : {},
    },
  })

  // If we have tokens, try to set the session
  if (authToken && refreshToken) {
    await client.auth.setSession({
      access_token: authToken,
      refresh_token: refreshToken,
    })
  }

  return client
}

// קבלת המשתמש הנוכחי מהשרת
export async function getCurrentUser() {
  try {
    const client = await createAuthServerClient()
    const { data: { user }, error } = await client.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch {
    return null
  }
}
