// Definiere die möglichen Standorte
export type LocationType = 'main' | 'downtown' | 'westside' | 'airport' | 'all' | string;

export interface QRCodeData {
  id: string;
  name: string;
  location: LocationType;
  formId?: string;
  color: string;
  backgroundColor: string;
  size: number;
  logoUrl?: string;
  scans: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface QRCodeCreateData {
  name: string;
  location: string;
  formId?: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
  logoUrl?: string;
  active?: boolean;
}

export interface QRCodeUpdateData extends QRCodeCreateData {
  id: string;
} 