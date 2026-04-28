import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Serve a fanpage estática na raiz antes do Next.js processar o dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/index.html', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
