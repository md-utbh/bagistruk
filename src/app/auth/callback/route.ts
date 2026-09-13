import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // React Strict Mode double-fires in dev, causing the second call to fail
      // with 'flow_state_already_used'. The first call already set the session
      // cookie, so we can safely redirect to dashboard.
      const isAlreadyUsed =
        error.message?.includes('already used') ||
        error.message?.includes('flow_state') ||
        error.code === 'flow_state_not_found'

      if (isAlreadyUsed) {
        console.warn('Auth code already exchanged (likely Strict Mode double-fire), redirecting anyway.')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      console.error('Exchange code error:', error.message)
    } catch (err) {
      console.error('Callback exception:', err)
    }
  }

  // Jika error / code tidak ada, kembali ke halaman utama dengan error
  return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
}
