// middleware.ts

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from 'auth'
import { createRouteMatcher } from './utils/create-route-matcher'


const isProtectedRoute = createRouteMatcher(['/dashboard/:path*', '/account/:path*'])
const isPublicRoute = createRouteMatcher(['/auth/sign-in', '/auth/signup', '/'])
const isDisabledRoute = createRouteMatcher([
    // Add routes here that should be disabled (return 404)
    // Example: '/old-page', '/legacy/:path*'
])

export async function proxy(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers })

    // Return 404 for disabled routes
    if (isDisabledRoute(req)) {
        return new NextResponse(null, { status: 404 })
    }

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute(req) && !session) {
        return NextResponse.redirect(new URL('/auth/sign-in', req.url))
    }

    // Redirect logged-in users away from auth pages
    if (isPublicRoute(req) && session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ]
}
