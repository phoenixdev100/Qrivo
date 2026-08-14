'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  User,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { useAuth } from '@/hooks/use-auth';
import { foldersApi } from '@/lib/api/folders';
import { qrApi } from '@/lib/api/qr';

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [folder, setFolder] = useState<any>(null);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadFolderData = async () => {
      if (!user || !params.id) return;
      try {
        const [folderResponse, qrResponse] = await Promise.all([
          foldersApi.get(params.id as string),
          qrApi.list({ folderId: params.id as string }),
        ]);
        setFolder(folderResponse.folder);
        setQrCodes(qrResponse.items || []);
      } catch (error) {
        console.error('Failed to load folder data:', error);
        router.push('/dashboard/folders');
      } finally {
        setIsLoading(false);
      }
    };
    loadFolderData();
  }, [user, params.id, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };

    if (userDropdownOpen || menuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userDropdownOpen, menuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleRemoveFromFolder = async (qrId: string) => {
    setIsRemoving(qrId);
    try {
      await qrApi.update(qrId, { folderId: null });
      // Reload QR codes
      const qrResponse = await qrApi.list({ folderId: params.id as string });
      setQrCodes(qrResponse.items || []);
      setMenuOpen(null);
    } catch (error) {
      console.error('Failed to remove QR from folder:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleDeleteQr = async (qrId: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;
    setIsDeleting(qrId);
    try {
      await qrApi.remove(qrId);
      // Reload QR codes
      const qrResponse = await qrApi.list({ folderId: params.id as string });
      setQrCodes(qrResponse.items || []);
      setMenuOpen(null);
    } catch (error) {
      console.error('Failed to delete QR code:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading || isLoading) {
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
    { icon: QrCode, label: 'QR Codes', href: '/dashboard/qrcodes' },
    { icon: FolderTree, label: 'Folders', href: '/dashboard/folders', active: true },
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/folders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Folders
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{folder?.name || 'Folder'}</h1>
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-medium hover:bg-brand-200 transition-colors dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg py-1 dark:border-slate-700 dark:bg-slate-900 z-50">
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{folder?.name || 'Folder'}</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{qrCodes.length} QR codes in this folder</p>
              </div>
              <Button onClick={() => router.push('/dashboard/qrcodes/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create QR Code
              </Button>
            </div>

            {/* QR Codes list */}
            {qrCodes.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {qrCodes.map((qr) => (
                  <div
                    key={qr.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                          <QrCode className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-slate-900 dark:text-slate-50">{qr.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{qr.type}</p>
                        </div>
                      </div>
                      <div className="relative" ref={menuRef}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMenuOpen(menuOpen === qr.id ? null : qr.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {menuOpen === qr.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg py-1 dark:border-slate-700 dark:bg-slate-900 z-50">
                            <button
                              onClick={() => handleRemoveFromFolder(qr.id)}
                              disabled={isRemoving === qr.id}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isRemoving === qr.id ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <FolderTree className="h-4 w-4" />
                                  Remove from folder
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteQr(qr.id)}
                              disabled={isDeleting === qr.id}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeleting === qr.id ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  Delete QR code
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-card dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-col items-center justify-center text-center">
                  <QrCode className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">No QR codes in this folder</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">Create your first QR code to get started.</p>
                  <Button className="mt-4" onClick={() => router.push('/dashboard/qrcodes/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create QR Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
