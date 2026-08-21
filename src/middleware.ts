import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname, search, searchParams } = request.nextUrl
  const isAuthPage = pathname.startsWith('/login')

  console.log("--- Middleware Executed ---");
  console.log("Request Path:", pathname);
  console.log("Auth Token:", token ? "Present (Valid)" : "Missing");

  // ১. টোকেন নাই এবং অথ পেজও না -> লগইনে পাঠান এবং কারেন্ট ইউআরএল সেভ রাখুন
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url)
    const fullUrl = `${pathname}${search}`
    loginUrl.searchParams.set('redirect_url', fullUrl)
    return NextResponse.redirect(loginUrl)
  }

  // ২. টোকেন আছে কিন্তু ইউজার লগইন পেজে যাওয়ার চেষ্টা করছে -> আগের পেজে ফেরত পাঠান
  if (token && isAuthPage) {
    const redirectUrl = searchParams.get('redirect_url')
    
    // চেক করুন redirect_url ভ্যালিড কিনা এবং সেটি কোনো ইন্টারনাল ফাইল বা লগইন পেজ নিজেই কিনা
    const hasValidRedirect = redirectUrl && 
                             redirectUrl.startsWith('/') && 
                             !redirectUrl.startsWith('//') && 
                             !redirectUrl.startsWith('/login');

    const destination = hasValidRedirect ? redirectUrl : '/summary'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // ৩. টোকেন আছে এবং রুট (/) বা খালি পাথে আছে -> ড্যাশবোর্ড/সামারিতে পাঠান
  if (token && (pathname === '/' || pathname === '')) {
    return NextResponse.redirect(new URL('/summary', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Next.js ইন্টারনাল ফাইল, স্ট্যাটিক ফাইল, ইমেজ এবং ব্রাউজারের .well-known 
     * রিকোয়েস্টগুলোকে মিডলওয়্যার থেকে সম্পূর্ণ বাদ দেওয়া হলো।
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.well-known).*)',
  ],
}
