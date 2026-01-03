import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// יצירת קליינט Supabase לשימוש בצד השרת
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}
