import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const role = token?.role;
    const canAccessDashboard = role === 'ADMIN' || role === 'EDITOR';
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute && !canAccessDashboard) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' || token?.role === 'EDITOR';
        }
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.AUTH_SECRET || 'dev-secret-change-me',
  },
);

export const config = {
  matcher: ['/admin/:path*'],
};