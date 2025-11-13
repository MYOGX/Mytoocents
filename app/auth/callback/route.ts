import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }

    // Successfully authenticated - redirect to home dashboard
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}

