import * as React from 'react';
import { PasswordResetEmailProps } from '@/types/email';

export const PasswordResetEmail: React.FC<Readonly<PasswordResetEmailProps>> = ({
  name,
  resetLink,
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
          Du hast eine Anfrage zum Zurücksetzen deines Passworts gesendet. Klicke auf den Button unten, um dein Passwort zurückzusetzen.
        </p>
        <a href={resetLink} style={{
          display: 'inline-block',
          backgroundColor: '#6366f1',
          color: 'white',
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontWeight: 500,
          marginBottom: '24px',
        }}>Passwort zurücksetzen</a>
        <div style={{
          backgroundColor: '#fffbeb',
          padding: '16px',
          borderRadius: '6px',
          borderLeft: '4px solid #f59e0b',
          marginBottom: '24px',
        }}>
          <strong>Wichtig:</strong> Dieser Link ist 30 Minuten gültig. Wenn du diese Anfrage nicht gestellt hast, ignoriere bitte diese E-Mail.
        </div>
        <p style={{
          marginBottom: '24px',
          color: '#4b5563',
        }}>
          Falls der Button nicht funktioniert, kopiere diese URL in deinen Browser:<br />
          <a href={resetLink} style={{ color: '#6366f1' }}>{resetLink}</a>
        </p>
        <p style={{
          marginBottom: '24px',
          color: '#4b5563',
        }}>
          Viele Grüße,<br />
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

export default PasswordResetEmail; 