import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { isBrowser } from './utils';
import { QRCodeData, QRCodeCreateData, QRCodeUpdateData } from '@/types/qr-code';

// QR-Code Service
export class QRCodeService {
  /**
   * Generiert ein QR-Code-Bild als DataURL
   */
  static async generateQRCodeDataURL(
    content: string,
    options: {
      color?: string;
      backgroundColor?: string;
      size?: number;
      logoUrl?: string;
    } = {}
  ): Promise<string> {
    if (!isBrowser) {
      throw new Error("QR-Code-Generierung ist nur im Browser verfügbar");
    }

    const { 
      color = "#000000", 
      backgroundColor = "#ffffff", 
      size = 200 
    } = options;

    try {
      // QR-Code als Daten-URL generieren
      const qrCodeDataURL = await QRCode.toDataURL(content, {
        width: size,
        margin: 2,
        color: {
          dark: color,
          light: backgroundColor,
        },
        errorCorrectionLevel: 'H', // Höchste Fehlerkorrekturstufe für Logo-Platzierung
      });

      // Wenn kein Logo gewünscht ist, den QR-Code direkt zurückgeben
      if (!options.logoUrl) {
        return qrCodeDataURL;
      }

      // Logo zum QR-Code hinzufügen
      return await this.addLogoToQRCode(qrCodeDataURL, options.logoUrl, size);
    } catch (error) {
      console.error("Fehler beim Generieren des QR-Codes:", error);
      throw new Error("QR-Code konnte nicht generiert werden");
    }
  }

  /**
   * Fügt ein Logo zum QR-Code hinzu
   */
  private static async addLogoToQRCode(
    qrCodeDataURL: string,
    logoUrl: string,
    size: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Canvas-Kontext konnte nicht erstellt werden"));
        return;
      }

      // Canvas-Größe setzen
      canvas.width = size;
      canvas.height = size;

      // QR-Code auf Canvas zeichnen
      const qrCodeImg = new Image();
      qrCodeImg.onload = () => {
        ctx.drawImage(qrCodeImg, 0, 0, size, size);

        // Logo auf Canvas zeichnen
        const logoImg = new Image();
        logoImg.onload = () => {
          // Logo in der Mitte platzieren und auf 20% der QR-Code-Größe skalieren
          const logoSize = size * 0.2;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          // Weißen Hintergrund für das Logo erstellen
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

          // Logo zeichnen
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          // Fertigen QR-Code mit Logo als Daten-URL zurückgeben
          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.onerror = () => {
          reject(new Error("Logo konnte nicht geladen werden"));
        };
        logoImg.src = logoUrl;
      };
      qrCodeImg.onerror = () => {
        reject(new Error("QR-Code konnte nicht geladen werden"));
      };
      qrCodeImg.src = qrCodeDataURL;
    });
  }

  /**
   * Erstellt ein druckfertiges PDF mit dem QR-Code
   */
  static async generateQRCodePDF(
    qrData: {
      dataURL: string;
      name: string;
      location: string;
    },
    options: {
      includeInstructions?: boolean;
      pageSize?: 'a4' | 'a5';
    } = {}
  ): Promise<Blob> {
    if (!isBrowser) {
      throw new Error("PDF-Generierung ist nur im Browser verfügbar");
    }

    const { includeInstructions = true, pageSize = 'a4' } = options;

    try {
      // PDF-Dokument erstellen
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize,
      });

      // Seitengrößen ermitteln
      const pageWidth = pageSize === 'a4' ? 210 : 148;
      const pageHeight = pageSize === 'a4' ? 297 : 210;
      
      // QR-Code-Dimensionen berechnen (50% der Seitenbreite)
      const qrCodeSize = pageWidth * 0.5;
      const qrCodeX = (pageWidth - qrCodeSize) / 2;
      let qrCodeY = pageHeight * 0.25;

      // Titel hinzufügen
      pdf.setFontSize(20);
      pdf.text(qrData.name, pageWidth / 2, qrCodeY - 20, { align: 'center' });
      
      // Standort hinzufügen
      pdf.setFontSize(12);
      pdf.text(`Standort: ${qrData.location}`, pageWidth / 2, qrCodeY - 10, { align: 'center' });

      // QR-Code zum PDF hinzufügen
      pdf.addImage(qrData.dataURL, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

      // Optional Anweisungen hinzufügen
      if (includeInstructions) {
        const instructionsY = qrCodeY + qrCodeSize + 20;
        pdf.setFontSize(14);
        pdf.text('Hinweise:', pageWidth / 2, instructionsY, { align: 'center' });
        
        pdf.setFontSize(10);
        const instructions = [
          '1. Scannen Sie diesen QR-Code mit Ihrem Smartphone.',
          '2. Geben Sie Ihr Feedback direkt auf der angezeigten Webseite ein.',
          '3. Ihre Meinung hilft uns, unseren Service zu verbessern.',
          '4. Vielen Dank für Ihre Unterstützung!',
        ];
        
        instructions.forEach((line, index) => {
          pdf.text(line, pageWidth / 2, instructionsY + 8 + (index * 5), { align: 'center' });
        });
      }

      // PDF als Blob zurückgeben
      return pdf.output('blob');
    } catch (error) {
      console.error("Fehler beim Erstellen des PDF:", error);
      throw new Error("PDF konnte nicht erstellt werden");
    }
  }

  /**
   * Erstellt die URL für einen QR-Code, der zum Feedback-Formular führt
   */
  static createFeedbackURL(qrCodeId: string, baseUrl: string = window.location.origin): string {
    return `${baseUrl}/feedback/${qrCodeId}`;
  }
} 