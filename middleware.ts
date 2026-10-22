import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_EMAIL } from '@/lib/supabase/admin-access'

export async function middleware(request: NextRequest) {
  const supabase = await createClient()
  const pathname = request.nextUrl.pathname
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('Session verification failed:', authError)
  const isProtectedPath = pathname.startsWith('/dashboard')
  const isLoginPath = pathname === '/admin-login'
  const teacherSegments = pathname.split('/').filter(Boolean)
  const isTeacherClassPath = teacherSegments[0] === 'teachers'
    && teacherSegments.length >= 2
    && !['login', 'setup-password'].includes(teacherSegments[1])
  const isStudentClassPath = teacherSegments[0] === 'classroom'
    && teacherSegments.length >= 3
    && teacherSegments[2] === 'dashboard'
  const classSlug = isTeacherClassPath
    ? teacherSegments[1]
    : isStudentClassPath
      ? teacherSegments[1]
      : ''
  let isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL

  if (user && !isAdmin && (isProtectedPath || isLoginPath)) {
    const { data: profile, error } = await supabase
      .from('admin_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Admin profile lookup failed:', error)
      return NextResponse.json({ error: 'Unable to verify admin access' }, { status: 500 })
    }

    isAdmin = Boolean(profile)
  }

  if (isProtectedPath && !user) {
    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((isProtectedPath || isLoginPath) && user && !isAdmin) {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Failed to sign out unauthorized user:', error)

    if (isLoginPath) return NextResponse.next()

    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  if ((isTeacherClassPath || isStudentClassPath) && !user) {
    const loginUrl = new URL(
      isTeacherClassPath ? `/teachers/login/${classSlug}` : `/classroom/${classSlug}/login`,
      request.url,
    )
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((isTeacherClassPath || isStudentClassPath) && user) {
    if (isTeacherClassPath && user.user_metadata?.must_change_password === true) {
      return NextResponse.redirect(new URL('/teachers/setup-password', request.url))
    }

    const { data: role, error } = await supabase.rpc('classroom_user_role', {
      p_course_slug: classSlug,
    })
    if (error) {
      console.error('Classroom access verification failed:', error)
      return NextResponse.json({ error: 'Unable to verify classroom access' }, { status: 503 })
    }

    const expectedRole = isTeacherClassPath ? 'teacher' : 'student'
    if (role !== expectedRole) {
      const loginUrl = new URL(
        isTeacherClassPath ? `/teachers/login/${classSlug}` : `/classroom/${classSlug}/login`,
        request.url,
      )
      loginUrl.searchParams.set('error', 'access')
      return NextResponse.redirect(loginUrl)
    }
  }

  if (isLoginPath && user && isAdmin) {
    const redirectPath = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    const redirectUrl = new URL(redirectPath, request.url)
    const safeRedirectUrl = redirectPath.startsWith('/')
      && redirectUrl.origin === request.nextUrl.origin
      ? redirectUrl
      : new URL('/dashboard', request.url)
    return NextResponse.redirect(safeRedirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin-login',
    '/teachers/:path*',
    '/classroom/:path*',
  ],
}