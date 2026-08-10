import { QrCode } from 'lucide-react';

export function QrivoIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white ${className}`}>
      <QrCode className="h-5 w-5" />
    </div>
  );
}
