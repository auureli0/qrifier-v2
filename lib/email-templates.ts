/**
 * E-Mail-Templates für QRifier
 */
export class EmailTemplates {
  /**
   * Willkommens-E-Mail-Template
   */
  static getWelcomeEmail(name: string): {
    subject: string;
    html: string;
    text: string;
  } {
    const subject = `Willkommen bei QRifier, ${name}!`;
    const text = `Willkommen bei QRifier, ${name}! Wir freuen uns, dass du dich für unseren Service entschieden hast. Du kannst jetzt mit dem Erstellen von QR-Codes und dem Sammeln von Feedback beginnen.`;
    const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Willkommen bei QRifier</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #6366f1;
        }
        .logo-icon {
          background-color: #6366f1;
          color: white;
          width: 40px;
          height: 40px;
          line-height: 40px;
          border-radius: 8px;
          display: inline-block;
          margin-right: 8px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #111827;
        }
        .text {
          margin-bottom: 24px;
          color: #4b5563;
        }
        .button {
          display: inline-block;
          background-color: #6366f1;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .features {
          margin: 30px 0;
        }
        .feature {
          margin-bottom: 16px;
          padding-left: 24px;
          position: relative;
        }
        .feature:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          color: #9ca3af;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">Q</span>
            QRifier
          </div>
        </div>
        <div class="content">
          <div class="greeting">Hallo ${name},</div>
          <p class="text">
            Willkommen bei QRifier! Wir freuen uns sehr, dass du dich für unseren Service entschieden hast. 
            Jetzt kannst du sofort mit dem Erstellen deiner QR-Codes beginnen und wertvolles Feedback von deinen Kunden sammeln.
          </p>
          <a href="https://qrifier.com/dashboard" class="button">Zum Dashboard</a>
          <div class="features">
            <div class="feature">Erstelle unbegrenzt QR-Codes mit deinem persönlichen Branding</div>
            <div class="feature">Sammle Feedback in Echtzeit</div>
            <div class="feature">Analysiere Kundenmeinungen und verbessere deinen Service</div>
          </div>
          <p class="text">
            Wenn du Fragen hast oder Hilfe benötigst, antworte einfach auf diese E-Mail. Unser Support-Team steht dir jederzeit zur Verfügung.
          </p>
          <p class="text">
            Viel Erfolg mit QRifier,<br>
            Das QRifier-Team
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} QRifier. Alle Rechte vorbehalten.</p>
          <p>
            Du erhältst diese E-Mail, weil du dich bei QRifier registriert hast.<br>
            Wenn du diese E-Mails nicht mehr erhalten möchtest, kannst du dich <a href="https://qrifier.com/unsubscribe">hier abmelden</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    return { subject, html, text };
  }

  /**
   * Passwort-Zurücksetzen-E-Mail-Template
   */
  static getPasswordResetEmail(name: string, resetLink: string): {
    subject: string;
    html: string;
    text: string;
  } {
    const subject = `Passwort zurücksetzen für QRifier`;
    const text = `Hallo ${name}, du hast eine Anfrage zum Zurücksetzen deines Passworts gesendet. Klicke auf diesen Link, um dein Passwort zurückzusetzen: ${resetLink}. Der Link ist 30 Minuten gültig. Wenn du diese Anfrage nicht gestellt hast, ignoriere bitte diese E-Mail.`;
    const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Passwort zurücksetzen</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #6366f1;
        }
        .logo-icon {
          background-color: #6366f1;
          color: white;
          width: 40px;
          height: 40px;
          line-height: 40px;
          border-radius: 8px;
          display: inline-block;
          margin-right: 8px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #111827;
        }
        .text {
          margin-bottom: 24px;
          color: #4b5563;
        }
        .button {
          display: inline-block;
          background-color: #6366f1;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .warning {
          background-color: #fffbeb;
          padding: 16px;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          margin-bottom: 24px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          color: #9ca3af;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">Q</span>
            QRifier
          </div>
        </div>
        <div class="content">
          <div class="greeting">Hallo ${name},</div>
          <p class="text">
            Du hast eine Anfrage zum Zurücksetzen deines Passworts gesendet. Klicke auf den Button unten, um dein Passwort zurückzusetzen.
          </p>
          <a href="${resetLink}" class="button">Passwort zurücksetzen</a>
          <div class="warning">
            <strong>Wichtig:</strong> Dieser Link ist 30 Minuten gültig. Wenn du diese Anfrage nicht gestellt hast, ignoriere bitte diese E-Mail.
          </div>
          <p class="text">
            Falls der Button nicht funktioniert, kopiere diese URL in deinen Browser:<br>
            <a href="${resetLink}">${resetLink}</a>
          </p>
          <p class="text">
            Viele Grüße,<br>
            Das QRifier-Team
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} QRifier. Alle Rechte vorbehalten.</p>
          <p>
            Du erhältst diese E-Mail, weil du dich bei QRifier registriert hast.<br>
            Wenn du diese E-Mails nicht mehr erhalten möchtest, kannst du dich <a href="https://qrifier.com/unsubscribe">hier abmelden</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    return { subject, html, text };
  }
} 