import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf_token';
const CSRF_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 Stunden

/**
 * Generiert einen sicheren CSRF-Token mit Web Crypto API
 */
export async function generateCsrfToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Speichert einen CSRF-Token als Cookie
 */
export async function setCsrfCookie(): Promise<string> {
  const token = await generateCsrfToken();
  const cookieStore = await cookies();
  
  cookieStore.set({
    name: CSRF_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY / 1000, // In Sekunden
  });
  
  return token;
}

/**
 * Middleware zur CSRF-Validierung
 */
export async function validateCsrf(request: NextRequest): Promise<boolean> {
  // CSRF-Validierung nur für Mutations-Methoden (POST, PUT, DELETE, PATCH)
  if (!CSRF_METHODS.includes(request.method)) {
    return true;
  }
  
  // Den Token aus dem Header holen
  const csrfHeader = request.headers.get(CSRF_HEADER);
  
  // Den Token aus dem Cookie holen
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE);
  
  // Beide Tokens müssen vorhanden und identisch sein
  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie.value) {
    return false;
  }
  
  return true;
}

/**
 * Middleware für CSRF-Schutz
 */
export function csrfProtection(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // CSRF-Token validieren
  if (!validateCsrf(request)) {
    return Promise.resolve(
      NextResponse.json(
        { error: 'Ungültiger oder fehlender CSRF-Token.' },
        { status: 403 }
      )
    );
  }
  
  // Request weiterleiten, wenn CSRF-Validierung erfolgreich war
  return handler(request);
} 