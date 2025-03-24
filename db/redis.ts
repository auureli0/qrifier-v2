import { Redis } from '@upstash/redis';
import { Logger } from '@/lib/logger';

// Redis-Konfiguration
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

// Prüfen, ob die erforderlichen Umgebungsvariablen vorhanden sind
if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Upstash Redis Konfiguration fehlt. Verwende Dummy-Implementation.');
  Logger.warn('Upstash Redis Konfiguration fehlt.', { 
    UPSTASH_REDIS_REST_URL_exists: !!UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN_exists: !!UPSTASH_REDIS_REST_TOKEN
  });
}

// Edge-kompatibler Redis-Client mit Upstash
const upstashRedis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Redis-Wrapper-Klasse für Edge-kompatible Redis-Operationen
 */
export class RedisClient {
  /**
   * Setzt einen Wert im Redis-Cache
   */
  async set(key: string, value: string, expireFlag?: string, expireTime?: number): Promise<void> {
    try {
      if (expireFlag === 'EX' && expireTime) {
        // Setze mit Ablaufzeit in Sekunden
        await upstashRedis.set(key, value, { ex: expireTime });
      } else if (expireFlag === 'PX' && expireTime) {
        // Setze mit Ablaufzeit in Millisekunden
        await upstashRedis.set(key, value, { px: expireTime });
      } else {
        await upstashRedis.set(key, value);
      }
    } catch (error) {
      Logger.error('Fehler beim Setzen eines Redis-Werts', { error, key });
      // Bei Edge-kompatiblem Code geben wir lieber keinen Fehler weiter
    }
  }

  /**
   * Ruft einen Wert aus dem Redis-Cache ab
   */
  async get(key: string): Promise<string | null> {
    try {
      const result = await upstashRedis.get(key);
      return result as string | null;
    } catch (error) {
      Logger.error('Fehler beim Abrufen eines Redis-Werts', { error, key });
      return null;
    }
  }

  /**
   * Löscht einen Wert aus dem Redis-Cache
   */
  async del(key: string): Promise<void> {
    try {
      await upstashRedis.del(key);
    } catch (error) {
      Logger.error('Fehler beim Löschen eines Redis-Werts', { error, key });
      // Bei Edge-kompatiblem Code geben wir lieber keinen Fehler weiter
    }
  }

  /**
   * Prüft, ob ein Schlüssel im Redis-Cache existiert
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await upstashRedis.exists(key);
      return !!result;
    } catch (error) {
      Logger.error('Fehler beim Prüfen der Existenz eines Redis-Schlüssels', { error, key });
      return false;
    }
  }

  /**
   * Setzt eine Ablaufzeit für einen Schlüssel
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await upstashRedis.expire(key, seconds);
    } catch (error) {
      Logger.error('Fehler beim Setzen der Ablaufzeit eines Redis-Schlüssels', { error, key });
      // Bei Edge-kompatiblem Code geben wir lieber keinen Fehler weiter
    }
  }
}

// Redis-Client-Instanz exportieren
export const redis = new RedisClient(); 