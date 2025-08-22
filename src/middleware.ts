import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add role-based route protection
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has permission for the route
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin' || token?.role === 'managing_director'
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}