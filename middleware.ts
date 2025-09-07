import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware for Authentication
 * 
 * Handles session management and authentication for all application routes.
 * Integrates with Supabase auth to maintain user sessions across requests
 * and automatically refresh expired tokens.
 * 
 * Key functions:
 * - Session validation and refresh for authenticated routes
 * - Automatic token renewal before expiration
 * - Cookie management for session persistence
 * - Request forwarding with updated authentication context
 * 
 * Security features:
 * - Validates JWT tokens on each request
 * - Refreshes tokens before expiration
 * - Maintains secure cookie-based sessions
 * - Handles authentication state changes
 * 
 * @param request - Incoming HTTP request with potential auth cookies
 * @returns Modified response with updated session cookies
 */
export async function middleware(request: any) {
  return await updateSession(request)
}

/**
 * Middleware Configuration
 * 
 * Defines which routes should be processed by the authentication middleware.
 * Excludes static assets and Next.js internal files for performance.
 * 
 * Included routes:
 * - All dynamic application routes (pages, API endpoints)
 * - Authentication-required pages
 * - API routes that need user context
 * 
 * Excluded routes:
 * - Static assets (_next/static/*)
 * - Image optimization files (_next/image/*)
 * - Favicon and common static files
 * - Media files (svg, png, jpg, jpeg, gif, webp)
 * 
 * This configuration ensures auth middleware runs only where needed,
 * improving performance while maintaining security.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static media files (images, icons)
     * 
     * This regex pattern ensures middleware runs on all dynamic routes
     * while bypassing static assets for optimal performance.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
