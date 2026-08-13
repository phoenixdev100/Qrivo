import Link from 'next/link';
import { QrivoIcon } from '@/components/ui/qr-icon';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="container-x py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
            <QrivoIcon />
            Qrivo
          </Link>
          <div className="flex gap-6 text-sm">
            <Link href="/#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
              Features
            </Link>
            <Link href="/register" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
              Sign up
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} <a href="https://github.com/phoenixdev100" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 dark:hover:text-slate-300">Deepak</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
