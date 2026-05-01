import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sempre serve a fanpage estática
  return NextResponse.rewrite(new URL('/index.html', request.url));
}

export const config = {
  matcher: ['/'],
};
