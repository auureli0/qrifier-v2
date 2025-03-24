import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { JwtService, JwtPayload } from './jwt-service';
import { Logger } from './logger';

// Geheimschlüssel für JWT aus der Umgebungsvariable
const JWT_SECRET = process.env.BETTER_AUTH_SECRET || 'fallback-secret-key-for-development';

/**
 * Generiert ein JWT-Token für einen Benutzer
 */
export async function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await new jose.SignJWT(payload as Record<string, any>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);
}

/**
 * Verifiziert ein JWT-Token und gibt den Payload zurück
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string | undefined,
      iat: payload.iat,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Fehler bei der JWT-Verifizierung:', error);
    return null;
  }
}

/**
 * Extrahiert die IP-Adresse aus dem Request
 */
function getClientIp(request: NextRequest): string {
  // Versuche, die IP-Adresse aus verschiedenen Headers zu extrahieren
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For kann mehrere IPs enthalten, wir nehmen die erste
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback
  return 'unknown';
}

/**
 * Prüft, ob der Benutzer authentifiziert ist
 */
export async function isAuthenticated(request: NextRequest): Promise<JwtPayload | null> {
  try {
    // Token aus dem Request extrahieren
    const token = await JwtService.extractTokenFromRequest(request);
    const clientIp = getClientIp(request);
    
    if (!token) {
      Logger.security('Authentifizierungsversuch ohne Token', { 
        ip: clientIp,
        url: request.nextUrl.pathname
      });
      return null;
    }

    // Token verifizieren
    const payload = await JwtService.verifyAccessToken(token);
    
    if (payload) {
      Logger.security('Erfolgreiche Authentifizierung', { 
        userId: payload.userId,
        url: request.nextUrl.pathname
      });
    }
    
    return payload;
  } catch (error) {
    Logger.error('Fehler bei der Authentifizierungsprüfung', { error });
    return null;
  }
}

/**
 * Middleware-Funktion, die einen authentifizierten Benutzer erfordert
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JwtPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await isAuthenticated(request);
  const clientIp = getClientIp(request);
  
  if (!user) {
    Logger.security('Zugriffsverweigerung aufgrund fehlender Authentifizierung', {
      ip: clientIp,
      url: request.nextUrl.pathname,
      method: request.method
    });
    
    return NextResponse.json(
      { error: 'Nicht authentifiziert. Bitte melden Sie sich an.' },
      { status: 401 }
    );
  }
  
  return handler(request, user);
}

/**
 * Middleware-Funktion, die einen Benutzer mit bestimmter Rolle erfordert
 */
export async function requireRole(
  request: NextRequest,
  role: string,
  handler: (request: NextRequest, user: JwtPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await isAuthenticated(request);
  const clientIp = getClientIp(request);
  
  if (!user) {
    Logger.security('Zugriffsverweigerung aufgrund fehlender Authentifizierung', {
      ip: clientIp,
      url: request.nextUrl.pathname,
      method: request.method
    });
    
    return NextResponse.json(
      { error: 'Nicht authentifiziert. Bitte melden Sie sich an.' },
      { status: 401 }
    );
  }
  
  if (user.role !== role) {
    Logger.security('Zugriffsverweigerung aufgrund unzureichender Berechtigungen', {
      userId: user.userId,
      url: request.nextUrl.pathname,
      method: request.method,
      requiredRole: role,
      actualRole: user.role
    });
    
    return NextResponse.json(
      { error: 'Unzureichende Berechtigungen für diese Aktion.' },
      { status: 403 }
    );
  }
  
  return handler(request, user);
}

/**
 * Hilfsklasse für die Authentifizierung
 */
export class AuthUtils {
  /**
   * Meldet einen Benutzer an und generiert neue Tokens
   */
  static async login(userId: string, email: string, role?: string): Promise<boolean> {
    try {
      // Token-Paar generieren
      const tokenPair = await JwtService.generateTokenPair({
        userId,
        email,
        role
      });
      
      // Tokens in Cookies speichern
      await JwtService.setTokenCookies(tokenPair.accessToken, tokenPair.refreshToken);
      
      Logger.security('Benutzer angemeldet', { userId, email });
      
      return true;
    } catch (error) {
      Logger.error('Fehler bei der Benutzeranmeldung', { error, userId });
      return false;
    }
  }
  
  /**
   * Meldet einen Benutzer ab und setzt seine Tokens auf die Blacklist
   */
  static async logout(request: NextRequest): Promise<boolean> {
    try {
      // Token aus dem Request extrahieren
      const accessToken = await JwtService.extractTokenFromRequest(request);
      
      if (accessToken) {
        // Token auf die Blacklist setzen
        await JwtService.blacklistToken(accessToken);
      }
      
      // Cookies löschen
      await JwtService.clearTokenCookies();
      
      Logger.security('Benutzer abgemeldet', { token: accessToken });
      
      return true;
    } catch (error) {
      Logger.error('Fehler bei der Benutzerabmeldung', { error });
      return false;
    }
  }
  
  /**
   * Erzwingt eine Token-Rotation (z.B. nach Passwortänderung)
   */
  static async forceTokenRotation(userId: string): Promise<boolean> {
    try {
      // Token-Rotation durchführen
      const success = await JwtService.rotateTokens(userId);
      
      if (success) {
        Logger.security('Token-Rotation erzwungen', { userId });
      }
      
      return success;
    } catch (error) {
      Logger.error('Fehler bei der erzwungenen Token-Rotation', { error, userId });
      return false;
    }
  }
} 