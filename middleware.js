import { NextResponse } from 'next/server';

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon|api/security-check).*)',
};

export async function middleware(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || req.headers.get('x-real-ip')
      || req.ip
      || 'unknown';
    // Ask our own API (which reads Redis) whether this IP is blocked.
    // Middleware runs on the Edge runtime, so we call back into a Node API route
    // rather than importing ioredis directly here.
    const checkUrl = new URL('/api/security-check', req.url);
    checkUrl.searchParams.set('ip', ip);
    const res = await fetch(checkUrl.toString());
    if (res.ok) {
      const data = await res.json();
      if (data.blocked) {
        return new NextResponse('Access denied.', { status: 403 });
      }
    }
  } catch (e) {
    // If the check itself fails, fail open rather than taking the whole site down.
  }
  return NextResponse.next();
}
