import Link from 'next/link';
import { QrivoIcon } from '@/components/ui/qr-icon';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/qr-types', label: 'QR Types' },
      { href: '/analytics', label: 'Analytics' },
      { href: '/security', label: 'Security' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { href: '/register', label: 'Create account' },
      { href: '/login', label: 'Sign in' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-x py-12">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <QrivoIcon />
              Qrivo
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              Qrivo, web-based dynamic QR codes with real scan analytics.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-slate-600 hover:text-slate-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Qrivo. All rights reserved.</p>
          <p className="text-sm text-slate-500">Dynamic QR Codes. Unlimited Scans.</p>
        </div>
      </div>
    </footer>
  );
}
