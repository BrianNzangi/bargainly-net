import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
            const url = new URL('/role/access', request.url)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
