import { NextRequest, NextResponse } from 'next/server';
import { setCsrfCookie } from '@/lib/csrf-protection';

/**
 * Generiert einen neuen CSRF-Token und gibt ihn zurück
 * Diese Route wird vom Frontend aufgerufen, um einen CSRF-Token für Formular-Übermittlungen zu erhalten
 */
export async function GET(request: NextRequest) {
  try {
    // Neuen CSRF-Token generieren und als Cookie setzen
    const token = await setCsrfCookie();
    
    // Token im Response zurückgeben, damit er im Frontend verwendet werden kann
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Fehler bei der CSRF-Token-Generierung:', error);
    return NextResponse.json(
      { error: 'Token konnte nicht generiert werden.' },
      { status: 500 }
    );
  }
} 