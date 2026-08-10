import { Hero } from '@/components/landing/hero';
import { TrustBar } from '@/components/landing/trust-bar';
import { Features } from '@/components/landing/features';
import { AnalyticsShowcase } from '@/components/landing/analytics-showcase';
import { QrTypes } from '@/components/landing/qr-types';
import { SecuritySection } from '@/components/landing/security-section';
import { FinalCta } from '@/components/landing/final-cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <AnalyticsShowcase />
      <QrTypes />
      <SecuritySection />
      <FinalCta />
    </>
  );
}
