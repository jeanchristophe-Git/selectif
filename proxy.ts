import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth-utils"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const user = await verifyToken(token)

      // Only admin role can access
      if (user?.role !== "ADMIN") {
        console.log(`Unauthorized admin access attempt: ${user?.email} (role: ${user?.role})`)
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      console.log(`✅ Admin access granted: ${user.email}`)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
}
