'use client';

import { useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Link2, Mail, Phone, Type, Wifi } from 'lucide-react';
import { QRPreview } from '@/components/qr/qr-preview';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
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

export function LiveQrGenerator() {
  const [type, setType] = useState<QRType>('URL');
  const [url, setUrl] = useState('https://freeqr.example.com');
  const [text, setText] = useState('Hello from FreeQR!');
  const [email, setEmail] = useState('hello@freeqr.dev');
  const [phone, setPhone] = useState('+1 555 010 0000');
  const [ssid, setSsid] = useState('FreeQR-Guest');
  const [wifiPassword, setWifiPassword] = useState('welcome123');
  const [color, setColor] = useState('#4F46E5');

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
    const dataUrl = await QRCode.toDataURL(payload, {
      width: 1024,
      margin: 2,
      color: { dark: color, light: '#FFFFFF' },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'freeqr-code.png';
    a.click();
  };

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated sm:p-6 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ type: t, label, icon: Icon }) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                type === t
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
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

          <div className="flex items-center gap-3">
            <Label htmlFor="lg-color" className="mb-0">
              Color
            </Label>
            <input
              id="lg-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-slate-300"
              aria-label="QR foreground color"
            />
            <Select value={color} onChange={(e) => setColor(e.target.value)} className="max-w-[160px]">
              <option value="#4F46E5">Indigo</option>
              <option value="#0F172A">Slate</option>
              <option value="#0EA5E9">Sky</option>
              <option value="#059669">Emerald</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <QRPreview value={payload} size={200} foreground={color} />
        </div>
        <Button onClick={download} className="w-full" disabled={!payload}>
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}
