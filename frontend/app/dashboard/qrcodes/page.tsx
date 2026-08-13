'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  ChevronDown,
  FolderTree,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Plus,
  QrCode,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { useAuth } from '@/hooks/use-auth';
import { qrApi } from '@/lib/api/qr';

export default function QrCodesPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [qrs, setQrs] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadQrCodes();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const loadQrCodes = async () => {
    try {
      const response = await qrApi.list({});
      setQrs(response.items || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load QR codes:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setQrToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!qrToDelete) return;
    try {
      await qrApi.remove(qrToDelete);
      setQrs(qrs.filter((qr) => qr.id !== qrToDelete));
      setDeleteModalOpen(false);
      setQrToDelete(null);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete QR code:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setQrToDelete(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: QrCode, label: 'QR Codes', href: '/dashboard/qrcodes', active: true },
    { icon: FolderTree, label: 'Folders', href: '/dashboard/folders' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 page-enter dark:bg-slate-950">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`hidden flex-col border-r border-slate-200 bg-white lg:flex transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
            sidebarCollapsed ? 'w-16' : 'w-48'
          }`}
        >
          <div className={`flex h-14 items-center border-b border-slate-200 ${sidebarCollapsed ? 'justify-center' : 'justify-between px-4'} dark:border-slate-800`}>
            <Link href="/" className="flex items-center gap-2">
              <QrivoIcon />
              {!sidebarCollapsed && (
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">Qrivo</span>
              )}
            </Link>
          </div>
          <nav className={`flex-1 ${sidebarCollapsed ? 'space-y-0 p-2' : 'space-y-1 p-4'}`}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                  sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-2'
                } ${
                  item.active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className={`border-t border-slate-200 ${sidebarCollapsed ? 'p-2' : 'p-2'} dark:border-slate-800`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`flex items-center justify-center rounded-lg text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 ${
                sidebarCollapsed ? 'px-2 py-2' : 'w-full gap-2 px-2 py-2'
              }`}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 dark:border-slate-800 dark:bg-slate-900 flex-shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">QR Codes</h1>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-medium hover:bg-brand-200 transition-colors dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg py-1 dark:border-slate-700 dark:bg-slate-900">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Your QR Codes</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Manage and track all your QR codes.</p>
              </div>
              <Link href="/dashboard/qrcodes/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create QR Code
                </Button>
              </Link>
            </div>

            {/* QR codes list */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800">
              {qrs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <QrCode className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">No QR codes yet</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">Create your first QR code to get started.</p>
                  <Link href="/dashboard/qrcodes/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first QR code
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {qrs.map((qr, index) => (
                    <div 
                      key={qr.id} 
                      className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        index === 0 ? 'rounded-t-xl' : ''
                      } ${
                        index === qrs.length - 1 ? 'rounded-b-xl' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                          <QrCode className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{qr.name || 'Untitled'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{qr.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            qr.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {qr.status}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{qr.scans || 0} scans</span>
                        <button
                          onClick={() => handleDelete(qr.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors dark:text-slate-500 dark:hover:text-red-400"
                          title="Delete QR code"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete QR Code</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this QR code? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
