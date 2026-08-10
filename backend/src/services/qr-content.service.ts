import type { QRContent, QRType } from '@prisma/client';

// Escapes special characters for MECARD/vCard/WIFI payloads.
function esc(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

// Builds the standard QR payload string for a given content record.
// Used for STATIC encoding (e.g. the public quick generator preview/download).
export function encodeContentPayload(type: QRType, c: Partial<QRContent>): string {
  switch (type) {
    case 'URL':
      return c.url ?? '';
    case 'TEXT':
      return c.text ?? '';
    case 'EMAIL': {
      const params = new URLSearchParams();
      if (c.emailSubject) params.set('subject', c.emailSubject);
      if (c.emailBody) params.set('body', c.emailBody);
      const qs = params.toString();
      return `mailto:${c.email ?? ''}${qs ? `?${qs}` : ''}`;
    }
    case 'PHONE':
      return `tel:${c.phone ?? ''}`;
    case 'WIFI': {
      const enc = c.wifiEncryption ?? 'WPA';
      const hidden = c.wifiHidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${esc(c.wifiSsid ?? '')};P:${esc(c.wifiPassword ?? '')};H:${hidden};;`;
    }
    case 'WHATSAPP': {
      const number = (c.waNumber ?? '').replace(/[^\d]/g, '');
      const text = c.waMessage ? `?text=${encodeURIComponent(c.waMessage)}` : '';
      return `https://wa.me/${number}${text}`;
    }
    case 'CONTACT': {
      const name = `${c.lastName ?? ''};${c.firstName ?? ''};;;`;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${name}`,
        `FN:${[c.firstName, c.lastName].filter(Boolean).join(' ')}`,
        c.organization ? `ORG:${c.organization}` : '',
        c.jobTitle ? `TITLE:${c.jobTitle}` : '',
        c.contactPhone ? `TEL:${c.contactPhone}` : '',
        c.contactEmail ? `EMAIL:${c.contactEmail}` : '',
        c.contactUrl ? `URL:${c.contactUrl}` : '',
        c.contactAddress ? `ADR:;;${c.contactAddress};;;;` : '',
        'END:VCARD',
      ].filter(Boolean);
      return lines.join('\n');
    }
    case 'LOCATION':
      return `geo:${c.latitude ?? 0},${c.longitude ?? 0}`;
    case 'EVENT': {
      const fmt = (d?: Date | null) =>
        d ? new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
      const lines = [
        'BEGIN:VEVENT',
        c.eventTitle ? `SUMMARY:${c.eventTitle}` : '',
        c.eventDescription ? `DESCRIPTION:${c.eventDescription}` : '',
        c.eventLocation ? `LOCATION:${c.eventLocation}` : '',
        c.eventStart ? `DTSTART:${fmt(c.eventStart)}` : '',
        c.eventEnd ? `DTEND:${fmt(c.eventEnd)}` : '',
        'END:VEVENT',
      ].filter(Boolean);
      return lines.join('\n');
    }
    default:
      return '';
  }
}
