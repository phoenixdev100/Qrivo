import { ArrowRight, Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { LiveQrGenerator } from './live-qr-generator';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(79,70,229,0.08),transparent)]" />
      <div className="container-x pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow mx-auto">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            Free forever · No app required to scan
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Dynamic QR codes.{' '}
            <span className="text-brand-600">Unlimited scans.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-slate-600">
            Create QR codes for links, WiFi, contacts and more. Change the destination anytime
            without reprinting, and track every scan with real analytics.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg">
              Start creating free
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/features" variant="outline" size="lg">
              See how it works
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-4xl animate-fade-up">
          <LiveQrGenerator />
          <p className="mt-3 text-center text-sm text-slate-500">
            Try it now - generate and download a QR code instantly, no sign-up needed.
          </p>
        </div>
      </div>
    </section>
  );
}
