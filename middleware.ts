import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const isAdmin = token?.role === 'ADMIN';
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN';
        }
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  },
);

export const config = {
  matcher: ['/admin/:path*'],
};
