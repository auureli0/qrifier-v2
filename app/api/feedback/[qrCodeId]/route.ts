import { NextResponse } from 'next/server';
import { recordQrCodeScan } from '@/server/qr-codes';

export async function GET(
  request: Request,
  { params }: { params: { qrCodeId: string } }
) {
  try {
    const qrCodeId = params.qrCodeId;
    
    if (!qrCodeId) {
      return NextResponse.json(
        { error: 'QR-Code-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    // QR-Code-Scan zählen
    const result = await recordQrCodeScan(qrCodeId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'QR-Code ist ungültig oder deaktiviert' },
        { status: 404 }
      );
    }
    
    // Weiterleitung zur Feedback-Seite
    return NextResponse.redirect(new URL(`/feedback/${qrCodeId}`, request.url));
  } catch (error) {
    console.error('Fehler beim Verarbeiten des QR-Code-Scans:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 