'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';

interface ScanResult {
  state: 'ok' | 'not_found' | 'disabled' | 'expired';
  type?: 'URL' | 'TEXT' | 'WIFI' | 'EMAIL' | 'PHONE';
  redirectUrl?: string;
  content?: any;
}

export default function ScanPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveScan() {
      try {
        const response = await fetch(`${config.apiUrl}/public/scan/${code}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to resolve scan');
        }

        const result: ScanResult = data.data;

        // Handle different states
        if (result.state === 'ok' && result.type === 'URL' && result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else if (result.state === 'ok') {
          // Non-URL content - show on frontend
          router.push(`/qr/${code}`);
        } else {
          // Error states
          router.push(`/qr/${code}?state=${result.state}`);
        }
      } catch (err) {
        console.error('Scan resolution error:', err);
        setError('Failed to resolve QR code');
        setTimeout(() => {
          router.push(`/qr/${code}?state=not_found`);
        }, 1000);
      } finally {
        setLoading(false);
      }
    }

    resolveScan();
  }, [code, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-slate-500 dark:text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Resolving QR code...</p>
      </div>
    </div>
  );
}
