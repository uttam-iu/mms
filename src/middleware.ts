import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  const { pathname, search } = request.nextUrl
  const isAuthPage = pathname.startsWith('/login')

  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url)
    const fullUrl = `${pathname}${search}`
    loginUrl.searchParams.set('redirect_url', fullUrl)
    return NextResponse.redirect(loginUrl)
  }

  if (token && isAuthPage) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect_url')
    const destination = redirectUrl?.startsWith('/') && !redirectUrl.startsWith('//')
      ? redirectUrl
      : '/summary'

    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.next()
}

// ৫. কোন কোন রাউটে এই মিডলওয়্যারটি কাজ করবে তা নির্দিষ্ট করুন
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
