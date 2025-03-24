// Edge-kompatible Logger-Implementierung
// Für Verwendung im Edge Runtime (Middleware, Edge API Routes)

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY', // Spezieller Level für Sicherheitsereignisse
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, any>;
}

/**
 * Edge-kompatible Logger-Klasse
 * Diese Version des Loggers ist für die Verwendung im Edge Runtime optimiert
 * und verzichtet auf Node.js-spezifische Features wie fs und path.
 */
export class Logger {
  /**
   * Erstellt einen Debug-Log-Eintrag
   */
  static debug(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Erstellt einen Info-Log-Eintrag
   */
  static info(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Erstellt einen Warn-Log-Eintrag
   */
  static warn(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Erstellt einen Error-Log-Eintrag
   */
  static error(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Erstellt einen Security-Log-Eintrag
   * Speziell für Sicherheitsereignisse wie Authentifizierungsversuche, Berechtigungsverweigerungen, etc.
   */
  static security(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.SECURITY, message, meta);
  }

  /**
   * Hilfsmethode zum Loggen
   * In einer Edge-Umgebung können wir nur auf die Konsole ausgeben
   */
  private static log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
    };

    // Im Edge Runtime können wir nur auf die Konsole ausgeben
    // In einer produktiven Umgebung könnten wir hier einen Logging-Service via API aufrufen
    if (level === LogLevel.ERROR || level === LogLevel.SECURITY) {
      console.error(`[${entry.level}] ${entry.message}`, entry.meta || '');
    } else {
      console.log(`[${entry.level}] ${entry.message}`, entry.meta || '');
    }
  }
} 