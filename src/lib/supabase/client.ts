import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for browser environments (Client Components).
 * It automatically uses window.env or process.env depending on the bundler setup.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
