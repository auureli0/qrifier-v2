"use server"

import { db } from "@/db/drizzle";
import { qrCode } from "@/db/schema";
import { auth, getSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validierungsschema für QR-Codes
const qrCodeSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein"),
  location: z.string().min(1, "Bitte wähle einen Standort"),
  formId: z.string().optional(),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Ungültiges Farbformat").default("#000000"),
  backgroundColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Ungültiges Farbformat").default("#ffffff"),
  size: z.number().min(100).max(400).default(200),
  logoUrl: z.string().optional(),
  active: z.boolean().default(true),
});

// QR-Code erstellen
export async function createQrCode(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const userId = session.userId;

    const data = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      formId: formData.get("formId") as string || undefined,
      color: formData.get("color") as string,
      backgroundColor: formData.get("backgroundColor") as string,
      size: parseInt(formData.get("size") as string, 10),
      logoUrl: formData.get("logoUrl") as string || undefined,
      active: formData.get("active") === "true",
    };

    // Validierung
    const validated = qrCodeSchema.parse(data);

    // In Datenbank speichern
    await db.insert(qrCode).values({
      id: uuidv4(),
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      scans: 0,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("QR-Code erstellen fehlgeschlagen:", error);
    return { success: false, error: "QR-Code konnte nicht erstellt werden" };
  }
}

// QR-Code aktualisieren
export async function updateQrCode(qrCodeId: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const userId = session.userId;

    // Überprüfe, ob QR-Code existiert und dem Benutzer gehört
    const existingQrCode = await db
      .select()
      .from(qrCode)
      .where(
        and(
          eq(qrCode.id, qrCodeId),
          eq(qrCode.userId, userId)
        )
      )
      .then(res => res[0]);

    if (!existingQrCode) {
      return { success: false, error: "QR-Code nicht gefunden oder keine Berechtigung" };
    }

    const data = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      formId: formData.get("formId") as string || undefined,
      color: formData.get("color") as string,
      backgroundColor: formData.get("backgroundColor") as string,
      size: parseInt(formData.get("size") as string, 10),
      logoUrl: formData.get("logoUrl") as string || undefined,
      active: formData.get("active") === "true",
    };

    // Validierung
    const validated = qrCodeSchema.parse(data);

    // In Datenbank aktualisieren
    await db
      .update(qrCode)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(qrCode.id, qrCodeId));

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("QR-Code aktualisieren fehlgeschlagen:", error);
    return { success: false, error: "QR-Code konnte nicht aktualisiert werden" };
  }
}

// QR-Code löschen
export async function deleteQrCode(qrCodeId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const userId = session.userId;

    // Überprüfe, ob QR-Code existiert und dem Benutzer gehört
    const existingQrCode = await db
      .select()
      .from(qrCode)
      .where(
        and(
          eq(qrCode.id, qrCodeId),
          eq(qrCode.userId, userId)
        )
      )
      .then(res => res[0]);

    if (!existingQrCode) {
      return { success: false, error: "QR-Code nicht gefunden oder keine Berechtigung" };
    }

    // Aus Datenbank löschen
    await db
      .delete(qrCode)
      .where(eq(qrCode.id, qrCodeId));

    return { success: true };
  } catch (error) {
    console.error("QR-Code löschen fehlgeschlagen:", error);
    return { success: false, error: "QR-Code konnte nicht gelöscht werden" };
  }
}

// QR-Code aktivieren/deaktivieren
export async function toggleQrCodeStatus(qrCodeId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const userId = session.userId;

    // Überprüfe, ob QR-Code existiert und dem Benutzer gehört
    const existingQrCode = await db
      .select()
      .from(qrCode)
      .where(
        and(
          eq(qrCode.id, qrCodeId),
          eq(qrCode.userId, userId)
        )
      )
      .then(res => res[0]);

    if (!existingQrCode) {
      return { success: false, error: "QR-Code nicht gefunden oder keine Berechtigung" };
    }

    // Status umkehren
    await db
      .update(qrCode)
      .set({
        active: !existingQrCode.active,
        updatedAt: new Date(),
      })
      .where(eq(qrCode.id, qrCodeId));

    return { success: true };
  } catch (error) {
    console.error("QR-Code-Status ändern fehlgeschlagen:", error);
    return { success: false, error: "QR-Code-Status konnte nicht geändert werden" };
  }
}

// QR-Code Scan zählen
export async function recordQrCodeScan(qrCodeId: string) {
  try {
    // Hier keine Authentifizierung notwendig, da dies öffentlich zugänglich sein muss
    const existingQrCode = await db
      .select()
      .from(qrCode)
      .where(eq(qrCode.id, qrCodeId))
      .then(res => res[0]);

    if (!existingQrCode) {
      return { success: false, error: "QR-Code nicht gefunden" };
    }

    if (!existingQrCode.active) {
      return { success: false, error: "QR-Code ist deaktiviert" };
    }

    // Scans erhöhen
    await db
      .update(qrCode)
      .set({
        scans: existingQrCode.scans + 1,
        updatedAt: new Date(),
      })
      .where(eq(qrCode.id, qrCodeId));

    return { success: true };
  } catch (error) {
    console.error("QR-Code-Scan aufzeichnen fehlgeschlagen:", error);
    return { success: false, error: "QR-Code-Scan konnte nicht aufgezeichnet werden" };
  }
}

// QR-Codes eines Benutzers abrufen
export async function getUserQrCodes() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const userId = session.userId;

    const userQrCodes = await db
      .select()
      .from(qrCode)
      .where(eq(qrCode.userId, userId))
      .orderBy(qrCode.createdAt);

    return { success: true, data: userQrCodes };
  } catch (error) {
    console.error("QR-Codes abrufen fehlgeschlagen:", error);
    return { success: false, error: "QR-Codes konnten nicht abgerufen werden" };
  }
}

// Einzelnen QR-Code abrufen
export async function getQrCode(qrCodeId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const userId = session.userId;

    const qrCodeData = await db
      .select()
      .from(qrCode)
      .where(
        and(
          eq(qrCode.id, qrCodeId),
          eq(qrCode.userId, userId)
        )
      )
      .then(res => res[0]);

    if (!qrCodeData) {
      return { success: false, error: "QR-Code nicht gefunden oder keine Berechtigung" };
    }

    return { success: true, data: qrCodeData };
  } catch (error) {
    console.error("QR-Code abrufen fehlgeschlagen:", error);
    return { success: false, error: "QR-Code konnte nicht abgerufen werden" };
  }
} 