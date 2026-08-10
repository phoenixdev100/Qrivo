import { Infinity as InfinityIcon, Lock, RefreshCw, Zap } from 'lucide-react';

const items = [
  { icon: InfinityIcon, title: 'Unlimited scans', desc: 'No caps on legitimate usage.' },
  { icon: RefreshCw, title: 'Editable destinations', desc: 'Change where a QR points, anytime.' },
  { icon: Zap, title: 'Instant analytics', desc: 'See scans as they happen.' },
  { icon: Lock, title: 'Privacy-conscious', desc: 'No raw IPs stored.' },
];

export function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="container-x grid grid-cols-2 gap-6 py-8 sm:py-10 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-card">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
