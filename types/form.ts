// Typen für Formular-Komponenten
export type FormComponentType = {
  id: string;
  type: "rating" | "text" | "choice";
  label: string;
  required: boolean;
  options?: string[];
};

// Typen für Formulare
export type FormType = 'feedback' | 'complaint';

export interface FormData {
  id: string;
  name: string;
  type: FormType;
  components: FormComponentType[];
  active: boolean;
  responses: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface FormCreateData {
  name: string;
  type: FormType;
  components: FormComponentType[];
  active?: boolean;
}

export interface FormUpdateData extends FormCreateData {
  id: string;
}

// Typen für Formular-Antworten
export interface FormResponseData {
  id: string;
  formId: string;
  qrCodeId?: string;
  data: Record<string, any>; // Antwortdaten zu den einzelnen Komponenten
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface FormResponseCreateData {
  formId: string;
  qrCodeId?: string;
  data: Record<string, any>;
} 