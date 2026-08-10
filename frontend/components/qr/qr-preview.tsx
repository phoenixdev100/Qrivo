'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils/cn';

interface QRPreviewProps {
  value: string;
  size?: number;
  foreground?: string;
  background?: string;
  margin?: number;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

// Renders a QR code to a PNG data URL entirely in the browser.
export function QRPreview({
  value,
  size = 256,
  foreground = '#0F172A',
  background = '#FFFFFF',
  margin = 2,
  errorCorrection = 'M',
  className,
}: QRPreviewProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    if (!value) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(value, {
      width: size,
      margin,
      errorCorrectionLevel: errorCorrection,
      color: { dark: foreground, light: background },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [value, size, foreground, background, margin, errorCorrection]);

  if (!dataUrl) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-lg bg-slate-100 text-slate-400', className)}
        style={{ width: size, height: size }}
      >
        <span className="text-sm">Enter content</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="QR code preview"
      width={size}
      height={size}
      className={cn('rounded-lg', className)}
    />
  );
}
