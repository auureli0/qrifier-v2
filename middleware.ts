import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated } from './lib/auth-utils';
import { Logger } from './lib/logger';

// Pfade, die geschützt sein sollen (erfordert Authentifizierung)
const PROTECTED_PATHS = [
	'/api/email',
	'/api/feedback',
	'/dashboard',
	'/profile',
	'/settings',
];

// Öffentliche Pfade (erfordern keine Authentifizierung)
const PUBLIC_PATHS = [
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
	'/api/auth',
	'/api/csrf-token', // CSRF-Token-Endpunkt muss öffentlich sein
];

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
 * Middleware-Funktion zur Authentifizierungsprüfung
 */
export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const clientIp = getClientIp(request);
	
	// Statische Assets und öffentliche Pfade überspringen
	if (
		pathname.startsWith('/_next') || 
		pathname.startsWith('/static') || 
		pathname.startsWith('/images') ||
		pathname.includes('.') || // Dateien mit Erweiterung (z.B. .js, .css)
		PUBLIC_PATHS.some(path => pathname.startsWith(path))
	) {
		return NextResponse.next();
	}
	
	// Prüfen, ob der Pfad geschützt ist
	const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
	
	if (isProtected) {
		Logger.debug('Zugriff auf geschützten Pfad', {
			path: pathname,
			ip: clientIp,
			method: request.method
		});
		
		const user = await isAuthenticated(request);
		
		// Wenn nicht authentifiziert und der Pfad geschützt ist, zur Anmeldeseite umleiten
		if (!user) {
			Logger.security('Umleitungsversuch aufgrund fehlender Authentifizierung', {
				path: pathname,
				ip: clientIp,
				method: request.method
			});
			
			const loginUrl = new URL('/login', request.url);
			loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
			return NextResponse.redirect(loginUrl);
		}

		Logger.debug('Authentifizierter Zugriff gewährt', {
			userId: user.userId,
			path: pathname
		});

		// Füge Benutzerinformationen zu Request-Headers hinzu (für API-Routen)
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set('x-user-id', user.userId);
		requestHeaders.set('x-user-email', user.email);
		if (user.role) {
			requestHeaders.set('x-user-role', user.role);
		}
		
		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	}
	
	// Für alle anderen Pfade den Request normal weitergeben
	return NextResponse.next();
}

// Middleware wird nur für die angegebenen Pfade ausgeführt
export const config = {
	matcher: [
		/*
		 * Entspricht allen Pfaden außer:
		 * 1. Alle statischen Assets in /public
		 * 2. Alle _next-spezifischen Pfade
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	]
};
