import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_EMAIL } from '@/lib/supabase/admin-access'

const academyDomain = 'techtrailblazeracademy.com'

export async function middleware(request: NextRequest) {
  const requestHost = (request.headers.get('host') ?? request.headers.get('x-forwarded-host') ?? request.nextUrl.hostname)
    .split(',')[0]
    .trim()
    .replace(/:\d+$/, '')
    .toLowerCase()
  const isAcademyDomain = requestHost === academyDomain || requestHost === `www.${academyDomain}`
  const requestedPath = request.nextUrl.pathname

  if (requestHost === academyDomain) {
    const canonicalUrl = request.nextUrl.clone()
    canonicalUrl.hostname = `www.${academyDomain}`
    return NextResponse.redirect(canonicalUrl)
  }

  if (isAcademyDomain && (requestedPath === '/academy' || requestedPath.startsWith('/academy/'))) {
    const publicUrl = request.nextUrl.clone()
    publicUrl.pathname = requestedPath.slice('/academy'.length) || '/'
    return NextResponse.redirect(publicUrl)
  }

  const academyRoute = requestedPath === '/'
    || ['/courses', '/about', '/contact'].includes(requestedPath)
    || requestedPath === '/classroom'
    || requestedPath.startsWith('/classroom/')
  const academyClassroomRoute = requestedPath === '/classroom'
    || requestedPath.startsWith('/classroom/')
  const academyRewriteUrl = isAcademyDomain && academyRoute
    ? request.nextUrl.clone()
    : null

  if (academyRewriteUrl) {
    academyRewriteUrl.pathname = `/academy${requestedPath === '/' ? '' : requestedPath}`
  }

  if (academyRewriteUrl && !academyClassroomRoute) {
    return NextResponse.rewrite(academyRewriteUrl)
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )
  const withAuthCookies = (result: NextResponse) => {
    response.cookies.getAll().forEach((cookie) => result.cookies.set(cookie))
    return result
  }
  const pathname = academyRewriteUrl?.pathname ?? requestedPath
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('Session verification failed:', authError)
  const isProtectedPath = pathname.startsWith('/dashboard')
  const isLoginPath = pathname === '/admin-login'
  const teacherSegments = pathname.split('/').filter(Boolean)
  const isAcademyPath = teacherSegments[0] === 'academy'
  const classroomSegments = isAcademyPath ? teacherSegments.slice(1) : teacherSegments
  const isTeacherClassPath = teacherSegments[0] === 'teachers'
    && teacherSegments.length >= 2
    && !['login', 'setup-password'].includes(teacherSegments[1])
  const isStudentClassPath = classroomSegments[0] === 'classroom'
    && classroomSegments.length >= 3
    && classroomSegments[2] === 'dashboard'
  const classSlug = isTeacherClassPath
    ? teacherSegments[1]
    : isStudentClassPath
      ? classroomSegments[1]
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
      return withAuthCookies(NextResponse.json({ error: 'Unable to verify admin access' }, { status: 500 }))
    }

    isAdmin = Boolean(profile)
  }

  if (isProtectedPath && !user) {
    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return withAuthCookies(NextResponse.redirect(loginUrl))
  }

  if ((isProtectedPath || isLoginPath) && user && !isAdmin) {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Failed to sign out unauthorized user:', error)

    if (isLoginPath) return withAuthCookies(NextResponse.next())

    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    return withAuthCookies(NextResponse.redirect(loginUrl))
  }

  if ((isTeacherClassPath || isStudentClassPath) && !user) {
    const loginUrl = new URL(
      isTeacherClassPath
        ? `/teachers/login/${classSlug}`
        : `${isAcademyDomain ? '' : isAcademyPath ? '/academy' : ''}/classroom/${classSlug}/login`,
      request.url,
    )
    loginUrl.searchParams.set('redirect', academyRewriteUrl ? requestedPath : pathname)
    return withAuthCookies(NextResponse.redirect(loginUrl))
  }

  if ((isTeacherClassPath || isStudentClassPath) && user) {
    if (isTeacherClassPath && user.user_metadata?.must_change_password === true) {
      return withAuthCookies(NextResponse.redirect(new URL('/teachers/setup-password', request.url)))
    }

    const { data: role, error } = await supabase.rpc('classroom_user_role', {
      p_course_slug: classSlug,
    })
    if (error) {
      console.error('Classroom access verification failed:', error)
      return withAuthCookies(NextResponse.json({ error: 'Unable to verify classroom access' }, { status: 503 }))
    }

    const expectedRole = isTeacherClassPath ? 'teacher' : 'student'
    if (role !== expectedRole) {
      const loginUrl = new URL(
        isTeacherClassPath
          ? `/teachers/login/${classSlug}`
          : `${isAcademyDomain ? '' : isAcademyPath ? '/academy' : ''}/classroom/${classSlug}/login`,
        request.url,
      )
      loginUrl.searchParams.set('error', 'access')
      return withAuthCookies(NextResponse.redirect(loginUrl))
    }
  }

  if (isLoginPath && user && isAdmin) {
    const redirectPath = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    const redirectUrl = new URL(redirectPath, request.url)
    const safeRedirectUrl = redirectPath.startsWith('/')
      && redirectUrl.origin === request.nextUrl.origin
      ? redirectUrl
      : new URL('/dashboard', request.url)
    return withAuthCookies(NextResponse.redirect(safeRedirectUrl))
  }

  return withAuthCookies(
    academyRewriteUrl ? NextResponse.rewrite(academyRewriteUrl, { request }) : response,
  )
}

export const config = {
  matcher: [
    '/',
    '/courses',
    '/about',
    '/contact',
    '/academy/:path*',
    '/dashboard/:path*',
    '/admin-login',
    '/teachers/:path*',
    '/classroom/:path*',
    '/academy/classroom/:path*',
  ],
}