"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// יצירת קליינט Supabase לשימוש בצד הלקוח
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// שימוש בתבנית Singleton כדי למנוע יצירת מופעים מרובים
export function getSupabaseBrowser() {
  if (!clientInstance) {
    clientInstance = createBrowserClient()
  }
  return clientInstance
}
