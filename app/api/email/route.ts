import { EmailService } from '@/lib/email-service';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, JwtPayload } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf-protection';
import { rateLimit } from '@/app/api/rate-limit';
import { Logger } from '@/lib/logger';

// Rate-Limit-Konfiguration für E-Mail-Anfragen: 5 Anfragen pro Minute
const EMAIL_RATE_LIMIT = {
  limit: 5,
  windowMs: 60 * 1000, // 1 Minute
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
 * Handler für E-Mail-API-Anfragen mit Authentifizierung, CSRF-Schutz und Rate-Limiting
 */
export async function POST(request: NextRequest) {
  // Rate-Limiting als äußerste Middleware anwenden
  return rateLimit(
    request,
    (req) => {
      // CSRF-Schutz als nächste Middleware anwenden
      return csrfProtection(req, (reqWithCsrf) => {
        // Authentifizierung als innerste Middleware anwenden
        return requireAuth(reqWithCsrf, handleEmailRequest);
      });
    },
    EMAIL_RATE_LIMIT,
    'email-api' // Eindeutige ID für diese Route im Rate-Limiter
  );
}

/**
 * Verarbeitet E-Mail-Anfragen nach erfolgreicher Authentifizierung
 */
async function handleEmailRequest(request: NextRequest, user: JwtPayload): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, data } = body;
    const clientIp = getClientIp(request);

    // Logging für Sicherheitsaudit
    Logger.security('E-Mail-API aufgerufen', { 
      userId: user.userId,
      email: user.email,
      type,
      ip: clientIp
    });

    if (!type || !data) {
      Logger.warn('Ungültige E-Mail-Anfrage - Fehlende Daten', {
        userId: user.userId,
        ip: clientIp
      });
      
      return NextResponse.json(
        { error: 'Ungültige Anfrage. "type" und "data" sind erforderlich.' },
        { status: 400 }
      );
    }

    let success = false;

    // E-Mail-Typ-Handler
    switch (type) {
      case 'welcome':
        // Willkommens-E-Mail
        const { email, name } = data;
        if (!email || !name) {
          Logger.warn('Ungültige Willkommens-E-Mail-Anfrage', {
            userId: user.userId,
            data
          });
          
          return NextResponse.json(
            { error: 'Ungültige Anfrage. "email" und "name" sind für Willkommens-E-Mails erforderlich.' },
            { status: 400 }
          );
        }
        
        Logger.info('Willkommens-E-Mail wird gesendet', { to: email, name });
        success = await EmailService.sendWelcomeEmail(email, name);
        break;

      case 'password-reset':
        // Passwort-Zurücksetzen-E-Mail
        const { email: resetEmail, name: resetName, resetLink } = data;
        if (!resetEmail || !resetName || !resetLink) {
          Logger.warn('Ungültige Passwort-Zurücksetzen-E-Mail-Anfrage', {
            userId: user.userId,
            data
          });
          
          return NextResponse.json(
            { error: 'Ungültige Anfrage. "email", "name" und "resetLink" sind für Passwort-Zurücksetzen-E-Mails erforderlich.' },
            { status: 400 }
          );
        }
        
        // Zusätzliche Sicherheitsprüfung für Passwort-Reset
        // Nur der Benutzer selbst oder ein Admin darf einen Reset anfordern
        if (resetEmail !== user.email && user.role !== 'admin') {
          Logger.security('Unzureichende Berechtigungen für Passwort-Reset', {
            userId: user.userId,
            targetEmail: resetEmail
          });
          
          return NextResponse.json(
            { error: 'Unzureichende Berechtigungen für diese Aktion.' },
            { status: 403 }
          );
        }
        
        Logger.info('Passwort-Zurücksetzen-E-Mail wird gesendet', { to: resetEmail, name: resetName });
        success = await EmailService.sendPasswordResetEmail(resetEmail, resetName, resetLink);
        break;

      default:
        Logger.warn('Unbekannter E-Mail-Typ', {
          userId: user.userId,
          type
        });
        
        return NextResponse.json(
          { error: `Unbekannter E-Mail-Typ: ${type}` },
          { status: 400 }
        );
    }

    if (!success) {
      Logger.error('E-Mail konnte nicht gesendet werden', {
        userId: user.userId,
        type,
        data
      });
      
      return NextResponse.json(
        { error: 'E-Mail konnte nicht gesendet werden.' },
        { status: 500 }
      );
    }

    Logger.info('E-Mail erfolgreich gesendet', {
      userId: user.userId,
      type,
      success
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.error('Fehler bei der E-Mail-API', { error, user });
    
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 