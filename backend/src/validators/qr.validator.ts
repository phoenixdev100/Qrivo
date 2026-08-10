import { z } from 'zod';
import { isSafeRedirectUrl } from '../utils/url-validator.js';

// ─── Content schemas (discriminated union on `type`) ───────────

const urlContent = z.object({
  type: z.literal('URL'),
  url: z
    .string()
    .trim()
    .refine(isSafeRedirectUrl, 'Enter a valid http(s) URL'),
});

const textContent = z.object({
  type: z.literal('TEXT'),
  text: z.string().trim().min(1, 'Text is required').max(2000),
});

const emailContent = z.object({
  type: z.literal('EMAIL'),
  email: z.string().trim().email('Enter a valid email'),
  emailSubject: z.string().trim().max(200).optional(),
  emailBody: z.string().trim().max(2000).optional(),
});

const phoneContent = z.object({
  type: z.literal('PHONE'),
  phone: z.string().trim().min(3, 'Enter a valid phone number').max(32),
});

const wifiContent = z.object({
  type: z.literal('WIFI'),
  wifiSsid: z.string().trim().min(1, 'Network name is required').max(64),
  wifiPassword: z.string().max(128).optional(),
  wifiEncryption: z.enum(['WPA', 'WEP', 'NOPASS']).default('WPA'),
  wifiHidden: z.boolean().default(false),
});

const whatsappContent = z.object({
  type: z.literal('WHATSAPP'),
  waNumber: z.string().trim().min(3, 'Enter a valid number').max(32),
  waMessage: z.string().trim().max(2000).optional(),
});

const contactContent = z.object({
  type: z.literal('CONTACT'),
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().max(80).optional(),
  organization: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  contactPhone: z.string().trim().max(32).optional(),
  contactUrl: z.string().trim().optional(),
  contactAddress: z.string().trim().max(240).optional(),
});

const locationContent = z.object({
  type: z.literal('LOCATION'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

const eventContent = z.object({
  type: z.literal('EVENT'),
  eventTitle: z.string().trim().min(1, 'Event title is required').max(200),
  eventDescription: z.string().trim().max(2000).optional(),
  eventLocation: z.string().trim().max(240).optional(),
  eventStart: z.coerce.date(),
  eventEnd: z.coerce.date().optional(),
});

export const qrContentSchema = z.discriminatedUnion('type', [
  urlContent,
  textContent,
  emailContent,
  phoneContent,
  wifiContent,
  whatsappContent,
  contactContent,
  locationContent,
  eventContent,
]);

export type QRContentInput = z.infer<typeof qrContentSchema>;

// ─── Customization schema ──────────────────────────────────────

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, 'Use a 6-digit hex color like #4F46E5');

export const customizationSchema = z.object({
  foregroundColor: hexColor.default('#0F172A'),
  backgroundColor: hexColor.default('#FFFFFF'),
  patternStyle: z.enum(['SQUARE', 'DOTS', 'ROUNDED']).default('SQUARE'),
  eyeStyle: z.enum(['SQUARE', 'CIRCLE', 'ROUNDED']).default('SQUARE'),
  size: z.coerce.number().int().min(128).max(2048).default(512),
  margin: z.coerce.number().int().min(0).max(16).default(2),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  frameStyle: z.enum(['NONE', 'SIMPLE', 'ROUNDED', 'BANNER']).default('NONE'),
  frameText: z.string().trim().max(40).optional(),
});

export type CustomizationInput = z.infer<typeof customizationSchema>;

// ─── QR create / update schemas ────────────────────────────────

export const createQrSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  folderId: z.string().cuid().optional().nullable(),
  content: qrContentSchema,
  customization: customizationSchema.partial().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const updateQrSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  folderId: z.string().cuid().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const updateDestinationSchema = z.object({
  content: qrContentSchema,
});

export const updateCustomizationSchema = customizationSchema.partial();

export const qrIdParamSchema = z.object({
  id: z.string().cuid('Invalid id'),
});

export const listQrQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  folderId: z.string().cuid().optional(),
  status: z.enum(['ACTIVE', 'DISABLED', 'EXPIRED', 'DELETED']).optional(),
});

export type CreateQrInput = z.infer<typeof createQrSchema>;
export type UpdateQrInput = z.infer<typeof updateQrSchema>;
export type ListQrQuery = z.infer<typeof listQrQuerySchema>;
