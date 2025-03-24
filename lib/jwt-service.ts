import * as jose from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { Logger } from './logger';
import { redis } from '@/db/redis';

// Geheimschlüssel für JWT aus der Umgebungsvariable
const JWT_SECRET = process.env.BETTER_AUTH_SECRET || 'fallback-secret-key-for-development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-for-development';

// Token-Konfiguration
const ACCESS_TOKEN_EXPIRY = '15m';       // Access-Token läuft nach 15 Minuten ab
const REFRESH_TOKEN_EXPIRY = '7d';       // Refresh-Token läuft nach 7 Tagen ab
const TOKEN_BLACKLIST_EXPIRY = 60 * 60;  // 1 Stunde (in Sekunden) für die Blacklist-Speicherung

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  jti?: string;           // Eindeutige Token-ID
  iat?: number;           // Issued At
  exp?: number;           // Expiration Time
  tokenVersion?: number;  // Für Token-Rotation
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generiert eine eindeutige Token-ID mit Web Crypto API
 */
async function generateTokenId(): Promise<string> {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Erstellt den Schlüssel für die Blacklist im Redis-Cache
 */
function getBlacklistKey(tokenId: string): string {
  return `jwt:blacklist:${tokenId}`;
}

/**
 * Erstellt den Schlüssel für die Token-Version im Redis-Cache
 */
function getTokenVersionKey(userId: string): string {
  return `jwt:version:${userId}`;
}

/**
 * JWT-Service für Token-Management
 */
export class JwtService {
  /**
   * Generiert ein neues Token-Paar (Access + Refresh)
   */
  static async generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp' | 'jti' | 'tokenVersion'>): Promise<TokenPair> {
    try {
      // Eindeutige Token-IDs generieren
      const accessJti = await generateTokenId();
      const refreshJti = await generateTokenId();
      
      // Aktuelle Token-Version abrufen oder neu erstellen
      const versionKey = getTokenVersionKey(payload.userId);
      let tokenVersion = 1;
      
      const storedVersion = await redis.get(versionKey);
      if (storedVersion) {
        tokenVersion = parseInt(storedVersion, 10);
      } else {
        // Neue Token-Version für diesen Benutzer speichern
        await redis.set(versionKey, tokenVersion.toString());
      }
      
      // Access-Token generieren
      const accessTokenPayload = { ...payload, jti: accessJti, tokenVersion };
      const accessToken = await new jose.SignJWT(accessTokenPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .sign(new TextEncoder().encode(JWT_SECRET));
      
      // Refresh-Token generieren
      const refreshTokenPayload = { userId: payload.userId, jti: refreshJti, tokenVersion };
      const refreshToken = await new jose.SignJWT(refreshTokenPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(new TextEncoder().encode(JWT_REFRESH_SECRET));
      
      Logger.security('Neues Token-Paar generiert', { 
        userId: payload.userId, 
        accessJti,
        refreshJti
      });
      
      return { accessToken, refreshToken };
    } catch (error) {
      Logger.error('Fehler bei der Token-Generierung', { error, payload });
      throw new Error('Token-Generierung fehlgeschlagen');
    }
  }
  
  /**
   * Verifiziert ein Access-Token
   */
  static async verifyAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      // Token verifizieren
      const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const jwtPayload = payload as unknown as JwtPayload;
      
      // Prüfen, ob das Token in der Blacklist ist
      if (jwtPayload.jti) {
        const isBlacklisted = await redis.get(getBlacklistKey(jwtPayload.jti));
        if (isBlacklisted) {
          Logger.security('Zugriffsversuch mit einem Token auf der Blacklist', { 
            jti: jwtPayload.jti,
            userId: jwtPayload.userId
          });
          return null;
        }
      }
      
      // Prüfen, ob die Token-Version gültig ist
      const versionKey = getTokenVersionKey(jwtPayload.userId);
      const currentVersion = await redis.get(versionKey);
      
      if (currentVersion && jwtPayload.tokenVersion !== undefined) {
        const storedVersion = parseInt(currentVersion, 10);
        if (jwtPayload.tokenVersion < storedVersion) {
          Logger.security('Zugriffsversuch mit veralteter Token-Version', { 
            userId: jwtPayload.userId,
            tokenVersion: jwtPayload.tokenVersion,
            currentVersion: storedVersion
          });
          return null;
        }
      }
      
      return jwtPayload;
    } catch (error) {
      Logger.security('Ungültiges Access-Token', { error });
      return null;
    }
  }
  
  /**
   * Verifiziert ein Refresh-Token und gibt ein neues Token-Paar zurück
   */
  static async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    try {
      // Refresh-Token verifizieren
      const { payload } = await jose.jwtVerify(refreshToken, new TextEncoder().encode(JWT_REFRESH_SECRET));
      const jwtPayload = payload as unknown as JwtPayload;
      
      // Prüfen, ob das Token in der Blacklist ist
      if (jwtPayload.jti) {
        const isBlacklisted = await redis.get(getBlacklistKey(jwtPayload.jti));
        if (isBlacklisted) {
          Logger.security('Token-Aktualisierung mit einem Token auf der Blacklist versucht', { 
            jti: jwtPayload.jti,
            userId: jwtPayload.userId
          });
          return null;
        }
      }
      
      // Prüfen, ob die Token-Version gültig ist
      const versionKey = getTokenVersionKey(jwtPayload.userId);
      const currentVersion = await redis.get(versionKey);
      
      if (currentVersion && jwtPayload.tokenVersion !== undefined) {
        const storedVersion = parseInt(currentVersion, 10);
        if (jwtPayload.tokenVersion < storedVersion) {
          Logger.security('Token-Aktualisierung mit veralteter Token-Version versucht', { 
            userId: jwtPayload.userId,
            tokenVersion: jwtPayload.tokenVersion,
            currentVersion: storedVersion
          });
          return null;
        }
      }
      
      // Benutzerinformationen abrufen
      // In einer echten Anwendung würde hier die Benutzer-ID verwendet, um weitere Benutzerinformationen 
      // aus der Datenbank abzurufen, z. B. E-Mail und Rolle
      const userId = jwtPayload.userId;
      
      // Da wir in diesem Beispiel keine echte Datenbank abfragen, 
      // erstellen wir einen Platzhalter-Payload
      const userData: Omit<JwtPayload, 'iat' | 'exp' | 'jti' | 'tokenVersion'> = {
        userId,
        email: 'user@example.com', // Dies würde in der Praxis aus der DB abgerufen
        role: 'user'               // Dies würde in der Praxis aus der DB abgerufen
      };
      
      // Altes Refresh-Token auf die Blacklist setzen
      if (jwtPayload.jti) {
        await redis.set(
          getBlacklistKey(jwtPayload.jti),
          '1',
          'EX',
          TOKEN_BLACKLIST_EXPIRY
        );
      }
      
      // Neue Token generieren
      const tokenPair = await this.generateTokenPair(userData);
      
      Logger.security('Token aktualisiert', { userId });
      
      return tokenPair;
    } catch (error) {
      Logger.security('Fehler bei der Token-Aktualisierung', { error });
      return null;
    }
  }
  
  /**
   * Fügt ein Token zur Blacklist hinzu (beim Logout)
   */
  static async blacklistToken(token: string): Promise<boolean> {
    try {
      // Token dekodieren, ohne die Signatur zu überprüfen
      const decoded = jose.decodeJwt(token) as unknown as JwtPayload;
      
      if (!decoded || !decoded.jti) {
        Logger.warn('Versuch, ein ungültiges Token auf die Blacklist zu setzen', { token });
        return false;
      }
      
      // Token auf die Blacklist setzen
      await redis.set(
        getBlacklistKey(decoded.jti),
        '1',
        'EX',
        TOKEN_BLACKLIST_EXPIRY
      );
      
      Logger.security('Token auf die Blacklist gesetzt', { 
        userId: decoded.userId,
        jti: decoded.jti
      });
      
      return true;
    } catch (error) {
      Logger.error('Fehler beim Hinzufügen des Tokens zur Blacklist', { error });
      return false;
    }
  }
  
  /**
   * Führt eine Token-Rotation durch (alle Tokens eines Benutzers ungültig machen)
   */
  static async rotateTokens(userId: string): Promise<boolean> {
    try {
      // Token-Version im Redis-Cache abrufen
      const versionKey = getTokenVersionKey(userId);
      const currentVersion = await redis.get(versionKey);
      
      // Neue Version festlegen
      let newVersion = 1;
      if (currentVersion) {
        newVersion = parseInt(currentVersion, 10) + 1;
      }
      
      // Neue Token-Version speichern
      await redis.set(versionKey, newVersion.toString());
      
      Logger.security('Token-Rotation durchgeführt', { 
        userId,
        newVersion
      });
      
      return true;
    } catch (error) {
      Logger.error('Fehler bei der Token-Rotation', { error, userId });
      return false;
    }
  }
  
  /**
   * Extrahiert ein Token aus dem Request
   */
  static async extractTokenFromRequest(request: NextRequest): Promise<string | null> {
    try {
      // Versuche, den Token aus verschiedenen Quellen zu extrahieren
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth_token');
      
      // Token aus Cookie oder Authorization-Header extrahieren
      let token: string | undefined;
      
      if (authCookie) {
        token = authCookie.value;
      } else {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
      return token || null;
    } catch (error) {
      Logger.error('Fehler beim Extrahieren des Tokens aus dem Request', { error });
      return null;
    }
  }
  
  /**
   * Speichert Tokens in Cookies
   */
  static async setTokenCookies(accessToken: string, refreshToken: string): Promise<void> {
    const cookieStore = await cookies();
    
    // Access-Token-Cookie setzen
    cookieStore.set({
      name: 'auth_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 Minuten in Sekunden
    });
    
    // Refresh-Token-Cookie setzen
    cookieStore.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 Tage in Sekunden
    });
  }
  
  /**
   * Löscht Token-Cookies (beim Logout)
   */
  static async clearTokenCookies(): Promise<void> {
    const cookieStore = await cookies();
    
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');
  }
} 