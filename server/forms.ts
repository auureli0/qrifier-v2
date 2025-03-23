"use server";

import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { form, formResponse } from "@/db/schema";
import { FormCreateData, FormData, FormUpdateData, FormResponseCreateData, FormResponseData } from "@/types/form";
import { getCurrentUser } from "@/lib/auth";

// Hilfsfunktion zum Konvertieren von DB-Resultaten
const convertFormData = (data: any): FormData => {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
};

const convertFormResponseData = (data: any): FormResponseData => {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};

// Alle Formulare eines Nutzers abrufen
export async function getUserForms() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const forms = await db.select().from(form).where(eq(form.userId, user.id));
    return { 
      success: true, 
      data: forms.map(f => convertFormData(f)) 
    };
  } catch (error) {
    console.error("Fehler beim Abrufen der Formulare:", error);
    return { success: false, error: "Formulare konnten nicht abgerufen werden" };
  }
}

// Ein bestimmtes Formular abrufen
export async function getFormById(formId: string) {
  try {
    const formData = await db.select().from(form).where(eq(form.id, formId)).limit(1);
    
    if (!formData || formData.length === 0) {
      return { success: false, error: "Formular nicht gefunden" };
    }
    
    return { 
      success: true, 
      data: convertFormData(formData[0]) 
    };
  } catch (error) {
    console.error("Fehler beim Abrufen des Formulars:", error);
    return { success: false, error: "Formular konnte nicht abgerufen werden" };
  }
}

// Neues Formular erstellen
export async function createForm(formData: FormCreateData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const now = new Date();
    const newForm = {
      id: uuidv4(),
      name: formData.name,
      type: formData.type,
      components: formData.components,
      active: formData.active ?? true,
      responses: 0,
      createdAt: now,
      updatedAt: now,
      userId: user.id
    };

    await db.insert(form).values(newForm);
    
    return { 
      success: true, 
      data: convertFormData(newForm) 
    };
  } catch (error) {
    console.error("Fehler beim Erstellen des Formulars:", error);
    return { success: false, error: "Formular konnte nicht erstellt werden" };
  }
}

// Formular aktualisieren
export async function updateForm(formUpdateData: FormUpdateData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    // Prüfen, ob das Formular existiert und dem Nutzer gehört
    const existingForm = await db.select().from(form).where(eq(form.id, formUpdateData.id)).limit(1);
    if (!existingForm || existingForm.length === 0) {
      return { success: false, error: "Formular nicht gefunden" };
    }
    
    if (existingForm[0].userId !== user.id) {
      return { success: false, error: "Keine Berechtigung zum Bearbeiten dieses Formulars" };
    }

    const updateData = {
      name: formUpdateData.name,
      type: formUpdateData.type,
      components: formUpdateData.components,
      active: formUpdateData.active ?? existingForm[0].active,
      updatedAt: new Date()
    };

    await db.update(form)
      .set(updateData)
      .where(eq(form.id, formUpdateData.id));
    
    return { success: true };
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Formulars:", error);
    return { success: false, error: "Formular konnte nicht aktualisiert werden" };
  }
}

// Formular löschen
export async function deleteForm(formId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    // Prüfen, ob das Formular existiert und dem Nutzer gehört
    const existingForm = await db.select().from(form).where(eq(form.id, formId)).limit(1);
    if (!existingForm || existingForm.length === 0) {
      return { success: false, error: "Formular nicht gefunden" };
    }
    
    if (existingForm[0].userId !== user.id) {
      return { success: false, error: "Keine Berechtigung zum Löschen dieses Formulars" };
    }

    await db.delete(form).where(eq(form.id, formId));
    
    return { success: true };
  } catch (error) {
    console.error("Fehler beim Löschen des Formulars:", error);
    return { success: false, error: "Formular konnte nicht gelöscht werden" };
  }
}

// Status eines Formulars umschalten (aktiv/inaktiv)
export async function toggleFormStatus(formId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    // Prüfen, ob das Formular existiert und dem Nutzer gehört
    const existingForm = await db.select().from(form).where(eq(form.id, formId)).limit(1);
    if (!existingForm || existingForm.length === 0) {
      return { success: false, error: "Formular nicht gefunden" };
    }
    
    if (existingForm[0].userId !== user.id) {
      return { success: false, error: "Keine Berechtigung zum Bearbeiten dieses Formulars" };
    }

    await db.update(form)
      .set({ 
        active: !existingForm[0].active,
        updatedAt: new Date()
      })
      .where(eq(form.id, formId));
    
    return { success: true };
  } catch (error) {
    console.error("Fehler beim Ändern des Formularstatus:", error);
    return { success: false, error: "Formularstatus konnte nicht geändert werden" };
  }
}

// Formular-Antwort speichern
export async function submitFormResponse(responseData: FormResponseCreateData) {
  try {
    // Prüfen, ob das Formular existiert und aktiv ist
    const formData = await db.select().from(form).where(eq(form.id, responseData.formId)).limit(1);
    if (!formData || formData.length === 0) {
      return { success: false, error: "Formular nicht gefunden" };
    }
    
    if (!formData[0].active) {
      return { success: false, error: "Dieses Formular ist derzeit nicht aktiv" };
    }

    const now = new Date();
    const newResponse = {
      id: uuidv4(),
      formId: responseData.formId,
      qrCodeId: responseData.qrCodeId,
      data: responseData.data,
      createdAt: now,
      // Hier könnten noch IP-Adresse und User-Agent gespeichert werden
    };

    await db.insert(formResponse).values(newResponse);
    
    // Zähler für Antworten erhöhen
    await db.update(form)
      .set({ 
        responses: formData[0].responses + 1,
        updatedAt: now
      })
      .where(eq(form.id, responseData.formId));
    
    return { 
      success: true, 
      data: convertFormResponseData(newResponse) 
    };
  } catch (error) {
    console.error("Fehler beim Speichern der Formular-Antwort:", error);
    return { success: false, error: "Antwort konnte nicht gespeichert werden" };
  }
}

// Formular-Antworten abrufen
export async function getFormResponses(formId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    // Prüfen, ob das Formular dem Nutzer gehört
    const formData = await db.select().from(form).where(eq(form.id, formId)).limit(1);
    if (!formData || formData.length === 0) {
      return { success: false, error: "Formular nicht gefunden" };
    }
    
    if (formData[0].userId !== user.id) {
      return { success: false, error: "Keine Berechtigung zum Abrufen der Antworten" };
    }

    const responses = await db.select()
      .from(formResponse)
      .where(eq(formResponse.formId, formId))
      .orderBy(formResponse.createdAt);
    
    return { 
      success: true, 
      data: responses.map(r => convertFormResponseData(r)) 
    };
  } catch (error) {
    console.error("Fehler beim Abrufen der Formular-Antworten:", error);
    return { success: false, error: "Antworten konnten nicht abgerufen werden" };
  }
} 