import type { Prisma, QRType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { qrRepository } from '../repositories/qr.repository.js';
import { folderRepository } from '../repositories/folder.repository.js';
import { generateCode } from '../utils/code-generator.js';
import { ApiError } from '../utils/api-error.js';
import { env } from '../config/env.js';
import { SCAN_PATH_PREFIX } from '../config/constants.js';
import type {
  CreateQrInput,
  CustomizationInput,
  QRContentInput,
  UpdateQrInput,
} from '../validators/qr.validator.js';

// Maps validated content input to QRContent columns (only relevant fields set).
function mapContentToColumns(content: QRContentInput): Prisma.QRContentCreateWithoutQrCodeInput {
  switch (content.type) {
    case 'URL':
      return { url: content.url };
    case 'TEXT':
      return { text: content.text };
    case 'EMAIL':
      return { email: content.email, emailSubject: content.emailSubject, emailBody: content.emailBody };
    case 'PHONE':
      return { phone: content.phone };
    case 'WIFI':
      return {
        wifiSsid: content.wifiSsid,
        wifiPassword: content.wifiPassword,
        wifiEncryption: content.wifiEncryption,
        wifiHidden: content.wifiHidden,
      };
    case 'WHATSAPP':
      return { waNumber: content.waNumber, waMessage: content.waMessage };
    case 'CONTACT':
      return {
        firstName: content.firstName,
        lastName: content.lastName,
        organization: content.organization,
        jobTitle: content.jobTitle,
        contactEmail: content.contactEmail || null,
        contactPhone: content.contactPhone,
        contactUrl: content.contactUrl,
        contactAddress: content.contactAddress,
      };
    case 'LOCATION':
      return { latitude: content.latitude, longitude: content.longitude };
    case 'EVENT':
      return {
        eventTitle: content.eventTitle,
        eventDescription: content.eventDescription,
        eventLocation: content.eventLocation,
        eventStart: content.eventStart,
        eventEnd: content.eventEnd,
      };
    default:
      return {};
  }
}

// Generates a code guaranteed unique against the DB (retries on rare collisions).
async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateCode();
    const existing = await qrRepository.codeExists(code);
    if (!existing) return code;
  }
  throw ApiError.internal('Could not generate a unique code, please retry');
}

export function buildTrackingUrl(code: string): string {
  return `${env.PUBLIC_BASE_URL}${SCAN_PATH_PREFIX}/${code}`;
}

async function assertFolderOwned(userId: string, folderId?: string | null): Promise<void> {
  if (!folderId) return;
  const folder = await folderRepository.findById(folderId);
  if (!folder || folder.userId !== userId) {
    throw ApiError.badRequest('Invalid folder');
  }
}

async function getOwnedQr(userId: string, id: string) {
  const qr = await qrRepository.findById(id);
  if (!qr || qr.status === 'DELETED' || qr.userId !== userId) {
    throw ApiError.notFound('QR code not found');
  }
  return qr;
}

export const qrService = {
  async create(userId: string, input: CreateQrInput) {
    await assertFolderOwned(userId, input.folderId);
    const code = await generateUniqueCode();

    const qr = await qrRepository.create({
      name: input.name,
      code,
      type: input.content.type as QRType,
      user: { connect: { id: userId } },
      ...(input.folderId ? { folder: { connect: { id: input.folderId } } } : {}),
      ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
      content: { create: mapContentToColumns(input.content) },
      customization: { create: input.customization ?? {} },
    });

    return { ...qr, trackingUrl: buildTrackingUrl(qr.code) };
  },

  async getById(userId: string, id: string) {
    const qr = await getOwnedQr(userId, id);
    return { ...qr, trackingUrl: buildTrackingUrl(qr.code) };
  },

  async list(userId: string, args: {
    page: number;
    pageSize: number;
    search?: string;
    folderId?: string;
    status?: 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'DELETED';
  }) {
    const [items, total] = await qrRepository.listByUser(userId, {
      skip: (args.page - 1) * args.pageSize,
      take: args.pageSize,
      search: args.search,
      folderId: args.folderId,
      status: args.status,
    });
    return {
      items: items.map((q) => ({ ...q, trackingUrl: buildTrackingUrl(q.code) })),
      total,
      page: args.page,
      pageSize: args.pageSize,
      totalPages: Math.ceil(total / args.pageSize) || 1,
    };
  },

  async update(userId: string, id: string, input: UpdateQrInput) {
    await getOwnedQr(userId, id);
    if (input.folderId !== undefined) await assertFolderOwned(userId, input.folderId);

    const data: Prisma.QRCodeUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt;
    if (input.folderId !== undefined) {
      data.folder = input.folderId
        ? { connect: { id: input.folderId } }
        : { disconnect: true };
    }
    const qr = await qrRepository.update(id, data);
    return { ...qr, trackingUrl: buildTrackingUrl(qr.code) };
  },

  async updateDestination(userId: string, id: string, content: QRContentInput) {
    const existing = await getOwnedQr(userId, id);
    if (existing.type !== content.type) {
      throw ApiError.badRequest('QR type cannot be changed after creation');
    }
    // Replace content columns atomically.
    await prisma.qRContent.update({
      where: { qrCodeId: id },
      data: {
        // reset all optional columns, then set the relevant ones
        url: null, text: null, email: null, emailSubject: null, emailBody: null,
        phone: null, wifiSsid: null, wifiPassword: null, wifiEncryption: null, wifiHidden: null,
        waNumber: null, waMessage: null, firstName: null, lastName: null, organization: null,
        jobTitle: null, contactEmail: null, contactPhone: null, contactUrl: null,
        contactAddress: null, latitude: null, longitude: null, eventTitle: null,
        eventDescription: null, eventLocation: null, eventStart: null, eventEnd: null,
        ...mapContentToColumns(content),
      },
    });
    const qr = await qrRepository.findById(id);
    return { ...qr!, trackingUrl: buildTrackingUrl(qr!.code) };
  },

  async updateCustomization(userId: string, id: string, input: Partial<CustomizationInput>) {
    await getOwnedQr(userId, id);
    await prisma.qRCustomization.update({ where: { qrCodeId: id }, data: input });
    const qr = await qrRepository.findById(id);
    return { ...qr!, trackingUrl: buildTrackingUrl(qr!.code) };
  },

  async setStatus(userId: string, id: string, status: 'ACTIVE' | 'DISABLED') {
    await getOwnedQr(userId, id);
    const qr = await qrRepository.update(id, { status });
    return { ...qr, trackingUrl: buildTrackingUrl(qr.code) };
  },

  async remove(userId: string, id: string) {
    await getOwnedQr(userId, id);
    // Soft-delete to preserve historical scan analytics integrity.
    await qrRepository.update(id, { status: 'DELETED' });
    return { id, status: 'DELETED' as const };
  },

  async duplicate(userId: string, id: string) {
    const source = await getOwnedQr(userId, id);
    const code = await generateUniqueCode();
    const content = source.content;
    const custom = source.customization;

    const qr = await qrRepository.create({
      name: `${source.name} (copy)`,
      code,
      type: source.type,
      user: { connect: { id: userId } },
      ...(source.folderId ? { folder: { connect: { id: source.folderId } } } : {}),
      content: {
        create: content
          ? (() => {
              const { id: _id, qrCodeId: _qid, ...rest } = content;
              return rest;
            })()
          : {},
      },
      customization: {
        create: custom
          ? (() => {
              const { id: _id, qrCodeId: _qid, ...rest } = custom;
              return rest;
            })()
          : {},
      },
    });
    return { ...qr, trackingUrl: buildTrackingUrl(qr.code) };
  },
};
