import { BarChart3, Edit3, FolderTree, Palette, QrCode, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: QrCode,
    title: 'Dynamic tracking URLs',
    desc: 'Every QR resolves through a short FreeQR link, so you keep control after printing.',
  },
  {
    icon: Edit3,
    title: 'Editable destinations',
    desc: 'Point a QR somewhere new without changing the printed code.',
  },
  {
    icon: BarChart3,
    title: 'Real scan analytics',
    desc: 'Track totals, unique estimates, devices, browsers and locations over time.',
  },
  {
    icon: Palette,
    title: 'On-brand customization',
    desc: 'Adjust colors, margins, size and error correction to match your brand.',
  },
  {
    icon: FolderTree,
    title: 'Organized with folders',
    desc: 'Group campaigns and codes into folders for tidy management.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    desc: 'URL validation, rate limiting and privacy-safe scan tracking built in.',
  },
];

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mx-auto">Features</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to run QR campaigns
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A focused, professional toolkit - without the bloat.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-6 transition-shadow hover:shadow-elevated">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
