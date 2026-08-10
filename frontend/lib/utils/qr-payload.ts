import type { QRContentInput } from '@/types/qr';

// Mirrors the backend content encoder - used only for the guest live preview
// (static encoding). Saved dynamic QRs always encode the tracking URL instead.
export function encodePayload(content: QRContentInput): string {
  switch (content.type) {
    case 'URL':
      return content.url;
    case 'TEXT':
      return content.text;
    case 'EMAIL': {
      const params = new URLSearchParams();
      if (content.emailSubject) params.set('subject', content.emailSubject);
      if (content.emailBody) params.set('body', content.emailBody);
      const qs = params.toString();
      return `mailto:${content.email}${qs ? `?${qs}` : ''}`;
    }
    case 'PHONE':
      return `tel:${content.phone}`;
    case 'WIFI':
      return `WIFI:T:${content.wifiEncryption ?? 'WPA'};S:${content.wifiSsid};P:${content.wifiPassword ?? ''};H:${content.wifiHidden ? 'true' : 'false'};;`;
    case 'WHATSAPP': {
      const number = content.waNumber.replace(/[^\d]/g, '');
      const text = content.waMessage ? `?text=${encodeURIComponent(content.waMessage)}` : '';
      return `https://wa.me/${number}${text}`;
    }
    case 'CONTACT':
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${content.lastName ?? ''};${content.firstName};;;`,
        `FN:${[content.firstName, content.lastName].filter(Boolean).join(' ')}`,
        content.organization ? `ORG:${content.organization}` : '',
        content.jobTitle ? `TITLE:${content.jobTitle}` : '',
        content.contactPhone ? `TEL:${content.contactPhone}` : '',
        content.contactEmail ? `EMAIL:${content.contactEmail}` : '',
        content.contactUrl ? `URL:${content.contactUrl}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    case 'LOCATION':
      return `geo:${content.latitude},${content.longitude}`;
    case 'EVENT':
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${content.eventTitle}`,
        content.eventDescription ? `DESCRIPTION:${content.eventDescription}` : '',
        content.eventLocation ? `LOCATION:${content.eventLocation}` : '',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\n');
    default:
      return '';
  }
}
