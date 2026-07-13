import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // If trying to access protected route without session, redirect to login
  if (isProtectedPath && !session) {
    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated but not the admin email, deny access to dashboard
  if (isProtectedPath && session && session.user.email !== 'amahchibu@gmail.com') {
    await supabase.auth.signOut()
    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/admin-login' && session) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin-login',
  ],
}