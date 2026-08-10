export type QRType =
  | 'URL'
  | 'TEXT'
  | 'EMAIL'
  | 'PHONE'
  | 'WIFI'
  | 'WHATSAPP'
  | 'CONTACT'
  | 'LOCATION'
  | 'EVENT';

export type QRStatus = 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'DELETED';

export interface QRCustomization {
  foregroundColor: string;
  backgroundColor: string;
  patternStyle: 'SQUARE' | 'DOTS' | 'ROUNDED';
  eyeStyle: 'SQUARE' | 'CIRCLE' | 'ROUNDED';
  size: number;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  frameStyle: 'NONE' | 'SIMPLE' | 'ROUNDED' | 'BANNER';
  frameText?: string | null;
}

export interface QRContent {
  url?: string | null;
  text?: string | null;
  email?: string | null;
  emailSubject?: string | null;
  emailBody?: string | null;
  phone?: string | null;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  wifiEncryption?: 'WPA' | 'WEP' | 'NOPASS' | null;
  wifiHidden?: boolean | null;
  waNumber?: string | null;
  waMessage?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organization?: string | null;
  jobTitle?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactUrl?: string | null;
  contactAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  eventTitle?: string | null;
  eventDescription?: string | null;
  eventLocation?: string | null;
  eventStart?: string | null;
  eventEnd?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  _count?: { qrCodes: number };
}

export interface QRCode {
  id: string;
  name: string;
  code: string;
  type: QRType;
  status: QRStatus;
  scanCount: number;
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  content?: QRContent | null;
  customization?: QRCustomization | null;
  folder?: Folder | null;
  trackingUrl: string;
}

// Discriminated content payload used when creating/updating a QR.
export type QRContentInput =
  | { type: 'URL'; url: string }
  | { type: 'TEXT'; text: string }
  | { type: 'EMAIL'; email: string; emailSubject?: string; emailBody?: string }
  | { type: 'PHONE'; phone: string }
  | { type: 'WIFI'; wifiSsid: string; wifiPassword?: string; wifiEncryption?: 'WPA' | 'WEP' | 'NOPASS'; wifiHidden?: boolean }
  | { type: 'WHATSAPP'; waNumber: string; waMessage?: string }
  | {
      type: 'CONTACT';
      firstName: string;
      lastName?: string;
      organization?: string;
      jobTitle?: string;
      contactEmail?: string;
      contactPhone?: string;
      contactUrl?: string;
      contactAddress?: string;
    }
  | { type: 'LOCATION'; latitude: number; longitude: number }
  | {
      type: 'EVENT';
      eventTitle: string;
      eventDescription?: string;
      eventLocation?: string;
      eventStart: string;
      eventEnd?: string;
    };

export interface CreateQRInput {
  name: string;
  folderId?: string | null;
  content: QRContentInput;
  customization?: Partial<QRCustomization>;
  expiresAt?: string | null;
}
