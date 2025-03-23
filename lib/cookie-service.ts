import Cookies from 'js-cookie';

// Namen der Cookies
const CONSENT_COOKIE = 'qrifier_cookie_consent';
const SESSION_COOKIE = 'better-auth.session_token';

// Cookie-Kategorien
export enum CookieCategory {
  NECESSARY = 'necessary',
  FUNCTIONAL = 'functional',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing'
}

// Cookie-Consent-Präferenzen
export interface CookieConsent {
  necessary: boolean;  // Immer true, da notwendig
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

// Cookie Information (für die Anzeige im Modal)
export interface CookieInfo {
  name: string;
  category: CookieCategory;
  purpose: string;
  duration: string;
  provider: string;
}

// Liste der Cookies in der Anwendung
export const cookiesList: CookieInfo[] = [
  {
    name: 'better-auth.session_token',
    category: CookieCategory.NECESSARY,
    purpose: 'Hält Sie angemeldet während Ihrer Sitzung und sorgt für Ihre Datensicherheit',
    duration: 'Sitzung',
    provider: 'QRifier'
  },
  {
    name: 'qrifier_cookie_consent',
    category: CookieCategory.NECESSARY,
    purpose: 'Speichert Ihre Cookie-Präferenzen auf dieser Website',
    duration: '12 Monate',
    provider: 'QRifier'
  },
  {
    name: '__next_hmr_refresh_hash__',
    category: CookieCategory.NECESSARY,
    purpose: 'Wird für die Hot-Module-Replacement-Funktion im Entwicklungsmodus benötigt',
    duration: 'Sitzung',
    provider: 'Next.js'
  },
  {
    name: 'qrifier_ui_preferences',
    category: CookieCategory.FUNCTIONAL,
    purpose: 'Verbessert Ihre Benutzererfahrung durch Speichern Ihrer UI-Einstellungen',
    duration: '12 Monate',
    provider: 'QRifier'
  },
  {
    name: '_ga',
    category: CookieCategory.ANALYTICS,
    purpose: 'Verbessert die Website-Leistung durch Analyse des Nutzerverhaltens',
    duration: '24 Monate',
    provider: 'Google Analytics'
  },
  {
    name: '_fbp',
    category: CookieCategory.MARKETING,
    purpose: 'Ermöglicht personalisierte Dienste und optimierte Nutzererfahrung',
    duration: '3 Monate',
    provider: 'Facebook'
  }
];

// Default Cookie-Einstellungen
const defaultConsent: CookieConsent = {
  necessary: true,  // Immer aktiviert
  functional: false, // Standardmäßig deaktiviert
  analytics: false,  // Standardmäßig deaktiviert
  marketing: false,  // Standardmäßig deaktiviert
  timestamp: Date.now()
};

/**
 * Cookie-Service zur Verwaltung aller Cookie-bezogenen Funktionen
 */
export class CookieService {
  /**
   * Überprüft, ob der Benutzer bereits eine Cookie-Entscheidung getroffen hat
   */
  static hasConsent(): boolean {
    return Cookies.get(CONSENT_COOKIE) !== undefined;
  }

  /**
   * Holt die aktuellen Cookie-Präferenzen des Benutzers
   */
  static getConsent(): CookieConsent {
    const consent = Cookies.get(CONSENT_COOKIE);
    if (!consent) {
      return { ...defaultConsent };
    }

    try {
      return JSON.parse(consent) as CookieConsent;
    } catch (error) {
      console.error('Fehler beim Parsen der Cookie-Einstellungen:', error);
      return { ...defaultConsent };
    }
  }

  /**
   * Speichert die Cookie-Präferenzen des Benutzers
   */
  static saveConsent(consent: Partial<CookieConsent>): void {
    const currentConsent = this.getConsent();
    const newConsent: CookieConsent = {
      ...currentConsent,
      ...consent,
      necessary: true, // Immer auf true setzen
      timestamp: Date.now()
    };

    // Cookie für 1 Jahr setzen
    Cookies.set(CONSENT_COOKIE, JSON.stringify(newConsent), { expires: 365 });
    
    // Cookie-Einstellungen anwenden
    this.applyConsent(newConsent);
  }

  /**
   * Wendet die Cookie-Einstellungen an (löscht nicht akzeptierte Cookies)
   */
  static applyConsent(consent: CookieConsent): void {
    // Notwendige Cookies werden nie gelöscht
    
    // Funktional-Cookies verwalten
    if (!consent.functional) {
      Cookies.remove('qrifier_ui_preferences');
    }
    
    // Analytics-Cookies verwalten
    if (!consent.analytics) {
      Cookies.remove('_ga');
      Cookies.remove('_gid');
      Cookies.remove('_gat');
    }
    
    // Marketing-Cookies verwalten
    if (!consent.marketing) {
      Cookies.remove('_fbp');
    }
  }

  /**
   * Akzeptiert alle Cookies
   */
  static acceptAll(): void {
    this.saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    });
  }

  /**
   * Akzeptiert nur notwendige Cookies
   */
  static acceptNecessaryOnly(): void {
    this.saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    });
  }

  /**
   * Prüft, ob eine bestimmte Cookie-Kategorie akzeptiert wurde
   */
  static isEnabled(category: CookieCategory): boolean {
    const consent = this.getConsent();
    return consent[category];
  }
} 