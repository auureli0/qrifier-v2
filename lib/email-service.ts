import nodemailer from 'nodemailer';
import { EmailTemplates } from './email-templates';

// Umgebungsvariablen abrufen
const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = parseInt(process.env.SMTP_PORT!, 10);
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD!;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@qrifier.com';
const FROM_NAME = process.env.FROM_NAME || 'QRifier';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
  console.error('SMTP-Konfiguration unvollständig. E-Mail-Versand deaktiviert.');
}

// Email-Transporter erstellen
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true für 465, false für andere Ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  tls: {
    // In Produktion auf true setzen
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

// Interface für E-Mail-Optionen
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

// E-Mail-Service
export class EmailService {
  /**
   * Sendet eine E-Mail
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
        replyTo: options.replyTo || FROM_EMAIL,
      });
      
      console.log(`E-Mail gesendet an: ${options.to}`);
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
    const { subject, html, text } = EmailTemplates.getWelcomeEmail(name);
    
    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Sendet eine Passwort-Zurücksetzen-E-Mail
   */
  static async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean> {
    const { subject, html, text } = EmailTemplates.getPasswordResetEmail(name, resetLink);
    
    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }
} 