import { Resend } from 'resend';
import { EmailOptions } from '@/types/email';
import { WelcomeEmail } from '@/components/email-templates/welcome-email';
import { PasswordResetEmail } from '@/components/email-templates/password-reset-email';
import * as React from 'react';

// Umgebungsvariablen abrufen
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@qrifier.com';
const FROM_NAME = process.env.FROM_NAME || 'QRifier';

if (!RESEND_API_KEY) {
  console.error('Resend API-Schlüssel nicht konfiguriert. E-Mail-Versand deaktiviert.');
}

// Resend-Instanz erstellen
const resend = new Resend(RESEND_API_KEY);

// E-Mail-Service
export class EmailService {
  /**
   * Sendet eine E-Mail
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: options.from || `${FROM_NAME} <${FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        react: options.react,
        replyTo: options.replyTo || FROM_EMAIL,
        cc: options.cc,
        bcc: options.bcc,
      });
      
      if (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
        return false;
      }
      
      console.log(`E-Mail gesendet an: ${options.to}, ID: ${data?.id}`);
      return true;
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      return false;
    }
  }

  /**
   * Sendet eine Willkommens-E-Mail
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Willkommen bei QRifier, ${name}!`,
      react: WelcomeEmail({ name }) as React.ReactElement,
    });
  }

  /**
   * Sendet eine Passwort-Zurücksetzen-E-Mail
   */
  static async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Passwort zurücksetzen für QRifier',
      react: PasswordResetEmail({ name, resetLink }) as React.ReactElement,
    });
  }
} 