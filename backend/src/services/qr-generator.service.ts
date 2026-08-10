import QRCode from 'qrcode';
import type { QRCustomization } from '@prisma/client';

export interface RenderOptions {
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

// Sensible defaults used when no stored customization exists (e.g. guest preview).
export const DEFAULT_RENDER: RenderOptions = {
  foregroundColor: '#0F172A',
  backgroundColor: '#FFFFFF',
  size: 512,
  margin: 2,
  errorCorrection: 'M',
};

export function toRenderOptions(c?: Partial<QRCustomization> | null): RenderOptions {
  if (!c) return DEFAULT_RENDER;
  return {
    foregroundColor: c.foregroundColor ?? DEFAULT_RENDER.foregroundColor,
    backgroundColor: c.backgroundColor ?? DEFAULT_RENDER.backgroundColor,
    size: c.size ?? DEFAULT_RENDER.size,
    margin: c.margin ?? DEFAULT_RENDER.margin,
    errorCorrection: (c.errorCorrection ?? DEFAULT_RENDER.errorCorrection) as RenderOptions['errorCorrection'],
  };
}

function baseOptions(opts: RenderOptions) {
  return {
    errorCorrectionLevel: opts.errorCorrection,
    margin: opts.margin,
    width: opts.size,
    color: {
      dark: opts.foregroundColor,
      light: opts.backgroundColor,
    },
  } as const;
}

// Generates a PNG buffer for the given payload string.
export async function generatePng(payload: string, opts: RenderOptions): Promise<Buffer> {
  return QRCode.toBuffer(payload, { type: 'png', ...baseOptions(opts) });
}

// Generates an SVG string for the given payload string.
export async function generateSvg(payload: string, opts: RenderOptions): Promise<string> {
  return QRCode.toString(payload, { type: 'svg', ...baseOptions(opts) });
}

// Generates a data URL (used for quick previews).
export async function generateDataUrl(payload: string, opts: RenderOptions): Promise<string> {
  return QRCode.toDataURL(payload, baseOptions(opts));
}
