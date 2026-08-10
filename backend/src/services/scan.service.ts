import { qrRepository } from '../repositories/qr.repository.js';
import { scanRepository } from '../repositories/scan.repository.js';
import { prisma } from '../config/database.js';
import { parseUserAgent } from '../utils/device-parser.js';
import { computeVisitorHash } from '../utils/hash.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { GeoInfo } from '../utils/geo-parser.js';

export interface ScanRequestInfo {
  ip: string;
  userAgent: string | undefined;
  geo: GeoInfo;
}

export type ResolutionState = 'ok' | 'not_found' | 'disabled' | 'expired';

export interface ResolutionResult {
  state: ResolutionState;
  code: string;
  type?: string;
  // For URL type when state === 'ok': the safe destination to redirect to.
  redirectUrl?: string;
}

export const scanService = {
  // Resolves a code and, when active, records the scan and increments the counter.
  // Optimized for the hot public scan path.
  async resolveAndRecord(code: string, info: ScanRequestInfo): Promise<ResolutionResult> {
    const qr = await qrRepository.findActiveByCode(code);

    if (!qr || qr.status === 'DELETED') {
      return { state: 'not_found', code };
    }
    if (qr.status === 'DISABLED') {
      return { state: 'disabled', code, type: qr.type };
    }
    if (qr.expiresAt && qr.expiresAt.getTime() < Date.now()) {
      // Lazily mark as expired.
      await prisma.qRCode.update({ where: { id: qr.id }, data: { status: 'EXPIRED' } }).catch(() => {});
      return { state: 'expired', code, type: qr.type };
    }

    // Record the scan (best-effort; never block resolution on analytics failure).
    void this.recordScan(qr.id, info);

    if (qr.type === 'URL' && qr.content?.url) {
      return { state: 'ok', code, type: qr.type, redirectUrl: qr.content.url };
    }
    return { state: 'ok', code, type: qr.type };
  },

  async recordScan(qrCodeId: string, info: ScanRequestInfo): Promise<void> {
    try {
      const device = parseUserAgent(info.userAgent);
      const visitorHash = computeVisitorHash(
        info.ip,
        info.userAgent ?? '',
        env.JWT_ACCESS_SECRET,
      );

      await prisma.$transaction([
        prisma.scan.create({
          data: {
            qrCode: { connect: { id: qrCodeId } },
            deviceType: device.deviceType,
            browser: device.browser,
            operatingSystem: device.operatingSystem,
            country: info.geo.country,
            region: info.geo.region,
            city: info.geo.city,
            visitorHash,
            userAgent: info.userAgent,
          },
        }),
        prisma.qRCode.update({
          where: { id: qrCodeId },
          data: { scanCount: { increment: 1 } },
        }),
      ]);
    } catch (err) {
      logger.error('Failed to record scan', {
        qrCodeId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  },

  // Public content for the scan landing page (does NOT record a scan).
  async getPublicContent(code: string) {
    const qr = await qrRepository.findActiveByCode(code);
    if (!qr || qr.status === 'DELETED') return { state: 'not_found' as const };
    if (qr.status === 'DISABLED') return { state: 'disabled' as const };
    if (qr.expiresAt && qr.expiresAt.getTime() < Date.now()) {
      return { state: 'expired' as const };
    }
    return {
      state: 'ok' as const,
      name: qr.name,
      type: qr.type,
      content: qr.content,
    };
  },

  listScans(qrCodeId: string, page: number, pageSize: number) {
    return scanRepository.listByQr(qrCodeId, {
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },
};
