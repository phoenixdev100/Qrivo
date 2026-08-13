import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';

export function FinalCta() {
  return (
    <section className="section">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(99,102,241,0.35),transparent)]" />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start creating dynamic QR codes today
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Free forever for normal usage. No credit card, no scan limits, no app required.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register" size="md">
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/login" size="md" variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-white/10">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
