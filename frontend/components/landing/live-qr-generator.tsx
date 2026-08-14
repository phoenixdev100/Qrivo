'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Download, Link2, Mail, Phone, Type, Wifi } from 'lucide-react';
import { QRPreview } from '@/components/qr/qr-preview';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { encodePayload } from '@/lib/utils/qr-payload';
import type { QRContentInput, QRType } from '@/types/qr';
import { cn } from '@/lib/utils/cn';

const TYPES: { type: QRType; label: string; icon: typeof Link2 }[] = [
  { type: 'URL', label: 'URL', icon: Link2 },
  { type: 'TEXT', label: 'Text', icon: Type },
  { type: 'EMAIL', label: 'Email', icon: Mail },
  { type: 'PHONE', label: 'Phone', icon: Phone },
  { type: 'WIFI', label: 'WiFi', icon: Wifi },
];

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#E11D48' },
  { name: 'Amber', value: '#D97706' },
];

export function LiveQrGenerator() {
  const [type, setType] = useState<QRType>('URL');
  const [url, setUrl] = useState('https://qrivo.example.com');
  const [text, setText] = useState('Hello from Qrivo!');
  const [email, setEmail] = useState('hello@qrivo.dev');
  const [phone, setPhone] = useState('+1 555 010 0000');
  const [ssid, setSsid] = useState('Qrivo-Guest');
  const [wifiPassword, setWifiPassword] = useState('welcome123');
  const [color, setColor] = useState('#000000');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'jpeg' | 'webp' | 'bmp'>('png');

  const content = useMemo<QRContentInput>(() => {
    switch (type) {
      case 'URL':
        return { type: 'URL', url };
      case 'TEXT':
        return { type: 'TEXT', text };
      case 'EMAIL':
        return { type: 'EMAIL', email };
      case 'PHONE':
        return { type: 'PHONE', phone };
      case 'WIFI':
        return { type: 'WIFI', wifiSsid: ssid, wifiPassword, wifiEncryption: 'WPA' };
      default:
        return { type: 'URL', url };
    }
  }, [type, url, text, email, phone, ssid, wifiPassword]);

  const payload = useMemo(() => {
    try {
      return encodePayload(content);
    } catch {
      return '';
    }
  }, [content]);

  const download = async () => {
    if (!payload) return;

    const options = {
      width: 1024,
      margin: 2,
      color: { dark: color, light: '#FFFFFF' },
    };

    if (downloadFormat === 'svg') {
      const svgString = await QRCode.toString(payload, {
        ...options,
        type: 'svg',
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrivo-code.svg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // For PNG, JPEG, WebP, BMP - use canvas conversion
      const dataUrl = await QRCode.toDataURL(payload, options);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const mimeType = downloadFormat === 'jpeg' ? 'image/jpeg' : downloadFormat === 'webp' ? 'image/webp' : downloadFormat === 'bmp' ? 'image/bmp' : 'image/png';
          const extension = downloadFormat === 'jpeg' ? 'jpg' : downloadFormat;
          const url = canvas.toDataURL(mimeType, 0.92);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qrivo-code.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      };
      img.src = dataUrl;
    }
  };

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated sm:p-6 md:grid-cols-[1fr_auto] dark:border-slate-700 dark:bg-slate-900">
      <div className="space-y-4">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/20 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Preview Mode:</strong> This generates static QR codes for testing. For dynamic, tracked QR codes with analytics and editability, <Link href="/register" className="underline hover:text-amber-900 dark:hover:text-amber-200">sign up for a free account</Link>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ type: t, label, icon: Icon }) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                type === t
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-400'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {type === 'URL' && (
            <div>
              <Label htmlFor="lg-url">Destination URL</Label>
              <Input id="lg-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
            </div>
          )}
          {type === 'TEXT' && (
            <div>
              <Label htmlFor="lg-text">Text</Label>
              <Input id="lg-text" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          )}
          {type === 'EMAIL' && (
            <div>
              <Label htmlFor="lg-email">Email address</Label>
              <Input id="lg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
          {type === 'PHONE' && (
            <div>
              <Label htmlFor="lg-phone">Phone number</Label>
              <Input id="lg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}
          {type === 'WIFI' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="lg-ssid">Network name</Label>
                <Input id="lg-ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lg-wifi-pass">Password</Label>
                <Input id="lg-wifi-pass" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="lg-color">Color</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORS.map(({ name, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all',
                    color === value
                      ? 'border-brand-600 ring-2 ring-brand-600/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                  )}
                  style={{ backgroundColor: value }}
                  title={name}
                  aria-label={`Select ${name} color`}
                >
                  {color === value && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
                      <span className="h-2 w-2 rounded-full bg-current" style={{ color: value }} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <QRPreview value={payload} size={200} foreground={color} />
        </div>
        <div className="flex gap-2 w-full">
          <Dropdown
            value={downloadFormat}
            onChange={(value) => setDownloadFormat(value as 'png' | 'svg' | 'jpeg' | 'webp' | 'bmp')}
            options={[
              { value: 'png', label: 'PNG' },
              { value: 'jpeg', label: 'JPG' },
              { value: 'webp', label: 'WebP' },
              { value: 'bmp', label: 'BMP' },
              { value: 'svg', label: 'SVG' },
            ]}
            className="w-20"
          />
          <Button onClick={download} className="flex-1" disabled={!payload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
