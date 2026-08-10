'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#qr-types', label: 'QR Types' },
  { href: '/#analytics', label: 'Analytics' },
  { href: '/#security', label: 'Security' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <QrivoIcon />
          <span className="text-lg">Qrivo</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Get started
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div className={cn('border-t border-slate-200 md:hidden', open ? 'block' : 'hidden')}>
        <div className="container-x space-y-1 py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <ButtonLink href="/login" variant="outline" size="sm" className="flex-1">
              Sign in
            </ButtonLink>
            <ButtonLink href="/register" size="sm" className="flex-1">
              Get started
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
