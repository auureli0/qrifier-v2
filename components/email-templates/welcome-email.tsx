import * as React from 'react';
import { WelcomeEmailProps } from '@/types/email';

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  name,
}) => (
  <div style={{
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: 1.6,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: '20px',
  }}>
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '20px 0',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#6366f1',
        }}>
          <span style={{
            backgroundColor: '#6366f1',
            color: 'white',
            width: '40px',
            height: '40px',
            lineHeight: '40px',
            borderRadius: '8px',
            display: 'inline-block',
            marginRight: '8px',
            textAlign: 'center',
          }}>Q</span>
          QRifier
        </div>
      </div>
      <div style={{
        padding: '30px 20px',
      }}>
        <div style={{
          fontSize: '22px',
          fontWeight: 600,
          marginBottom: '20px',
          color: '#111827',
        }}>Hallo {name},</div>
        <p style={{
          marginBottom: '24px',
          color: '#4b5563',
        }}>
          Willkommen bei QRifier! Wir freuen uns sehr, dass du dich für unseren Service entschieden hast. 
          Jetzt kannst du sofort mit dem Erstellen deiner QR-Codes beginnen und wertvolles Feedback von deinen Kunden sammeln.
        </p>
        <a href="https://qrifier.com/dashboard" style={{
          display: 'inline-block',
          backgroundColor: '#6366f1',
          color: 'white',
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontWeight: 500,
          marginBottom: '24px',
        }}>Zum Dashboard</a>
        <div style={{ margin: '30px 0' }}>
          <div style={{
            marginBottom: '16px',
            paddingLeft: '24px',
            position: 'relative',
          }}>✓ Erstelle unbegrenzt QR-Codes mit deinem persönlichen Branding</div>
          <div style={{
            marginBottom: '16px',
            paddingLeft: '24px',
            position: 'relative',
          }}>✓ Sammle Feedback in Echtzeit</div>
          <div style={{
            marginBottom: '16px',
            paddingLeft: '24px',
            position: 'relative',
          }}>✓ Analysiere Kundenmeinungen und verbessere deinen Service</div>
        </div>
        <p style={{
          marginBottom: '24px',
          color: '#4b5563',
        }}>
          Wenn du Fragen hast oder Hilfe benötigst, antworte einfach auf diese E-Mail. Unser Support-Team steht dir jederzeit zur Verfügung.
        </p>
        <p style={{
          marginBottom: '24px',
          color: '#4b5563',
        }}>
          Viel Erfolg mit QRifier,<br />
          Das QRifier-Team
        </p>
      </div>
      <div style={{
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #f0f0f0',
        color: '#9ca3af',
        fontSize: '14px',
      }}>
        <p>© {new Date().getFullYear()} QRifier. Alle Rechte vorbehalten.</p>
        <p>
          Du erhältst diese E-Mail, weil du dich bei QRifier registriert hast.<br />
          Wenn du diese E-Mails nicht mehr erhalten möchtest, kannst du dich <a href="https://qrifier.com/unsubscribe" style={{ color: '#6366f1' }}>hier abmelden</a>.
        </p>
      </div>
    </div>
  </div>
);

export default WelcomeEmail; 