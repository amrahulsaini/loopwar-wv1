import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/database';
// Use global fetch provided by Next.js runtime
import NodeCrypto from 'crypto';

// Define types for better type safety
interface User {
  id: number;
  username: string;
  email: string;
  isVerified?: boolean;
}

interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

interface GitHubProfile {
  id: number;
  login: string;
  email?: string;
  avatar_url?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
}

// Simple OAuth handler for Google (authorization code flow)
// Required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT_URL

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');
  const action = url.searchParams.get('action'); // 'start' or 'callback'

  if (!provider) {
    return NextResponse.json({ error: 'Missing provider' }, { status: 400 });
  }

  if (action === 'start') {
    if (provider === 'google') {
      const state = Math.random().toString(36).slice(2);
      const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URL || (process.env.NEXTAUTH_URL + '/api/auth/oauth?provider=google&action=callback'));
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&scope=openid%20email%20profile&redirect_uri=${redirectUri}&state=${state}&prompt=select_account`;
      return NextResponse.redirect(url);
    }

    if (provider === 'github') {
      const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URL || (process.env.NEXTAUTH_URL + '/api/auth/oauth?provider=github&action=callback'));
      const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=${redirectUri}`;
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  }

  if (action === 'callback') {
    // Google returns ?code=...&state=...
    const code = url.searchParams.get('code');
    if (provider === 'google') {
      if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID || '')}&client_secret=${encodeURIComponent(process.env.GOOGLE_CLIENT_SECRET || '')}&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URL || (process.env.NEXTAUTH_URL + '/api/auth/oauth?provider=google&action=callback'))}&grant_type=authorization_code`
      });

      const tokenData = await tokenRes.json();
      if (!tokenData || !tokenData.access_token) {
        return NextResponse.json({ error: 'Failed to fetch token', details: tokenData }, { status: 400 });
      }

      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const profile = await userinfoRes.json() as GoogleProfile;

      // Upsert user in DB
      const userEntry = await Database.upsertOAuthUser({
        provider: 'google',
        oauthId: profile.sub,
        email: profile.email,
        username: profile.name || profile.email.split('@')[0],
        profilePicture: profile.picture || undefined
      });

      // Create a session token and set cookies similar to login route
      const sessionToken = cryptoRandom();
      const user = userEntry as User;
      if (user?.id) {
        await Database.createSession(user.id, sessionToken);
      }

      const res = NextResponse.redirect(process.env.NEXTAUTH_URL || '/');
      res.cookies.set('sessionToken', sessionToken, { path: '/', maxAge: 60 * 60 * 24 * 30 });
      res.cookies.set('username', user.username || '', { path: '/', maxAge: 60 * 60 * 24 * 30 });
      res.cookies.set('userId', String(user.id || ''), { path: '/', maxAge: 60 * 60 * 24 * 30 });
      res.cookies.set('isVerified', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30 });

      return res;
    }

    if (provider === 'github') {
      // simple github flow
      const code = url.searchParams.get('code');
      if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code, redirect_uri: process.env.OAUTH_REDIRECT_URL || (process.env.NEXTAUTH_URL + '/api/auth/oauth?provider=github&action=callback') })
      });

      const tokenData = await tokenRes.json();
      if (!tokenData || !tokenData.access_token) return NextResponse.json({ error: 'Failed to get access token', details: tokenData }, { status: 400 });

      const userRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
      const profile = await userRes.json() as GitHubProfile;

      // get primary email
      const emailsRes = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
      const emails = await emailsRes.json() as GitHubEmail[];
      const primary = emails && Array.isArray(emails) ? emails.find((e: GitHubEmail) => e.primary) : null;
      const email = primary ? primary.email : (profile.email || '');

      const userEntry = await Database.upsertOAuthUser({
        provider: 'github',
        oauthId: String(profile.id),
        email,
        username: profile.login,
        profilePicture: profile.avatar_url || undefined
      });

      const sessionToken = cryptoRandom();
      const user = userEntry as User;
      if (user?.id) {
        await Database.createSession(user.id, sessionToken);
      }

      const res = NextResponse.redirect(process.env.NEXTAUTH_URL || '/');
      res.cookies.set('sessionToken', sessionToken, { path: '/', maxAge: 60 * 60 * 24 * 30 });
      res.cookies.set('username', user.username || '', { path: '/', maxAge: 60 * 60 * 24 * 30 });
      res.cookies.set('userId', String(user.id || ''), { path: '/', maxAge: 60 * 60 * 24 * 30 });
      res.cookies.set('isVerified', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30 });

      return res;
    }

    return NextResponse.json({ error: 'Unsupported callback provider' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Specify action=start or action=callback' }, { status: 400 });
}

function cryptoRandom() {
  try {
    const arr = new Uint8Array(32);
    // Use web crypto if available
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(arr);
      return Array.from(arr).map(v => v.toString(16).padStart(2, '0')).join('');
    }
    // Fallback to Node's crypto
    return NodeCrypto.randomBytes(32).toString('hex');
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
