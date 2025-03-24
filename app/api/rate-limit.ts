import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

// Einfacher In-Memory-Speicher für Rate-Limiting (in Produktionsumgebungen besser Redis verwenden)
const rateLimits: Record<string, { count: number; resetTime: number }> = {};

interface RateLimitConfig {
  // Maximale Anzahl von Anfragen im angegebenen Zeitfenster
  limit: number;
  // Zeitfenster in Millisekunden
  windowMs: number;
}

// Standard-Konfiguration für Rate-Limiting
const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 10, // 10 Anfragen
  windowMs: 60 * 1000, // pro Minute
};

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
 * Bereinigt alte Einträge aus dem Rate-Limit-Speicher
 */
function cleanupRateLimits(): void {
  const now = Date.now();
  
  Object.keys(rateLimits).forEach((key) => {
    if (rateLimits[key].resetTime < now) {
      delete rateLimits[key];
    }
  });
  
  // Alle 5 Minuten loggen wir die Anzahl der aktiven Rate-Limits
  if (now % (5 * 60 * 1000) < 1000) {
    Logger.info('Rate-Limit-Status', { 
      activeEntries: Object.keys(rateLimits).length
    });
  }
}

/**
 * Erstellt einen eindeutigen Schlüssel für das Rate-Limiting basierend auf IP und Route
 */
function getRateLimitKey(request: NextRequest, routeId?: string): string {
  const ip = getClientIp(request);
  const route = routeId || request.nextUrl.pathname;
  return `${ip}:${route}`;
}

/**
 * Middleware für Rate-Limiting
 */
export function rateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: Partial<RateLimitConfig> = {},
  routeId?: string
): Promise<NextResponse> {
  // Konfiguration mit Standardwerten zusammenführen
  const { limit, windowMs } = { ...DEFAULT_CONFIG, ...config };
  
  // Alte Einträge bereinigen
  cleanupRateLimits();
  
  // Schlüssel für das Rate-Limiting erstellen
  const key = getRateLimitKey(request, routeId);
  
  // Aktuelle Zeit
  const now = Date.now();
  
  // Neuen Eintrag erstellen, wenn keiner existiert
  if (!rateLimits[key]) {
    rateLimits[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }
  
  // Aktuellen Eintrag holen
  const current = rateLimits[key];
  
  // Eintrag zurücksetzen, wenn das Zeitfenster abgelaufen ist
  if (current.resetTime < now) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }
  
  // Anfragezähler erhöhen
  current.count += 1;
  
  // X-RateLimit-Headers setzen
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', Math.max(0, limit - current.count).toString());
  headers.set('X-RateLimit-Reset', current.resetTime.toString());
  
  // Wenn das Limit überschritten wurde, 429 Too Many Requests zurückgeben
  if (current.count > limit) {
    Logger.security('Rate-Limit überschritten', {
      ip: getClientIp(request),
      path: request.nextUrl.pathname,
      method: request.method,
      count: current.count,
      limit
    });
    
    return Promise.resolve(
      NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
        { 
          status: 429,
          headers,
        }
      )
    );
  }
  
  // Hohe Anfragezahlen loggen (z.B. 75% des Limits erreicht)
  if (current.count >= limit * 0.75) {
    Logger.warn('Hohes Rate-Limit-Aufkommen', {
      ip: getClientIp(request),
      path: request.nextUrl.pathname,
      method: request.method,
      count: current.count,
      limit
    });
  }
  
  // Anfrage weiterleiten, wenn das Limit nicht überschritten wurde
  return handler(request).then((response) => {
    // Rate-Limit-Header zum Response hinzufügen
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    return response;
  });
} 