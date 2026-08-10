'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Plus,
  QrCode,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { useAuth } from '@/hooks/use-auth';
import { qrApi } from '@/lib/api/qr';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [qrs, setQrs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, scans: 0, active: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const response = await qrApi.list({});
      setQrs(response.items || []);
      setStats({
        total: response.total || 0,
        scans: 0,
        active: response.items?.filter((qr: any) => qr.status === 'ACTIVE').length || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: QrCode, label: 'QR Codes', href: '/dashboard/qrcodes' },
    { icon: FolderTree, label: 'Folders', href: '/dashboard/folders' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 page-enter">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
            <QrivoIcon />
            <span className="text-lg font-semibold text-slate-900">Qrivo</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Top bar */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            {/* Welcome section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}!</h2>
              <p className="mt-1 text-slate-600">Here's what's happening with your QR codes today.</p>
            </div>

            {/* Stats cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total QR Codes</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <QrCode className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Scans</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{stats.scans}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active QR Codes</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{stats.active}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Folders</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <FolderTree className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/dashboard/qrcodes/new"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:shadow-elevated hover:border-brand-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Create QR Code</p>
                    <p className="text-sm text-slate-500">Generate a new QR</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/qrcodes"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:shadow-elevated hover:border-brand-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">View All QRs</p>
                    <p className="text-sm text-slate-500">Manage your codes</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:shadow-elevated hover:border-brand-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Analytics</p>
                    <p className="text-sm text-slate-500">View scan data</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/folders"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:shadow-elevated hover:border-brand-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Folders</p>
                    <p className="text-sm text-slate-500">Organize codes</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent QR Codes */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent QR Codes</h3>
                <Link href="/dashboard/qrcodes" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-card">
                {qrs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <QrCode className="h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-slate-500">No QR codes yet</p>
                    <Link href="/dashboard/qrcodes/new">
                      <Button className="mt-4">Create your first QR code</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {qrs.map((qr) => (
                      <div key={qr.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <QrCode className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{qr.name || 'Untitled'}</p>
                            <p className="text-sm text-slate-500">{qr.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              qr.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {qr.status}
                          </span>
                          <span className="text-sm text-slate-500">{qr.scans || 0} scans</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
