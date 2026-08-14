'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function QrCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const searchParams = useSearchParams();
  const state = searchParams.get('state');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const getStateInfo = () => {
    switch (state) {
      case 'disabled':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: 'QR Code Disabled',
          description: 'This QR code has been disabled by the owner and is no longer active.',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
        };
      case 'expired':
        return {
          icon: <Clock className="h-16 w-16 text-orange-500" />,
          title: 'QR Code Expired',
          description: 'This QR code has expired and is no longer valid.',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        };
      case 'not_found':
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-slate-500" />,
          title: 'QR Code Not Found',
          description: 'This QR code does not exist or has been deleted.',
          bgColor: 'bg-slate-50 dark:bg-slate-800',
        };
    }
  };

  const stateInfo = getStateInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`${stateInfo.bgColor} rounded-2xl p-8 text-center`}>
          <div className="flex justify-center mb-4">
            {stateInfo.icon}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {stateInfo.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {stateInfo.description}
          </p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm">
              Go to Qrivo
            </button>
          </Link>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          QR Code ID: {code}
        </p>
      </div>
    </div>
  );
}
