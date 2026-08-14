'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  BarChart3,
  ChevronDown,
  Download,
  Eye,
  FolderTree,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Plus,
  QrCode,
  RefreshCw,
  Settings,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { Dropdown } from '@/components/ui/dropdown';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { qrApi } from '@/lib/api/qr';
import { encodePayload } from '@/lib/utils/qr-payload';

export default function QrCodesPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const [qrs, setQrs] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [qrToView, setQrToView] = useState<any>(null);
  const [qrImageData, setQrImageData] = useState<string>('');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'jpeg' | 'webp' | 'bmp'>('png');
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    setIsRefreshing(true);
    try {
      const response = await qrApi.list({});
      setQrs(response.items || []);
      showToast('Refreshed', 'success');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load QR codes:', error);
      }
      showToast('Failed to refresh', 'error');
    } finally {
      setIsRefreshing(false);
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

  const handleView = async (qr: any) => {
    setQrToView(qr);
    setViewModalOpen(true);
    
    // Generate QR code from tracking URL (not content directly)
    try {
      // Remove /api/v1 prefix if present to get base URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const baseUrl = apiUrl.replace(/\/api\/v1$/, '');
      const trackingUrl = `${baseUrl}/q/${qr.code}`;
      const dataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: qr.customization?.foregroundColor || '#000000',
          light: qr.customization?.backgroundColor || '#FFFFFF',
        },
      });
      setQrImageData(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleViewModalClose = async () => {
    setViewModalOpen(false);
    setQrToView(null);
    setQrImageData('');
    // Refresh QR codes to get updated scan counts
    await loadQrCodes();
  };

  const handleDownload = async () => {
    if (!qrToView) return;
    
    try {
      // Remove /api/v1 prefix if present to get base URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const baseUrl = apiUrl.replace(/\/api\/v1$/, '');
      const trackingUrl = `${baseUrl}/q/${qrToView.code}`;
      const options = {
        width: 512,
        margin: 2,
        color: {
          dark: qrToView.customization?.foregroundColor || '#000000',
          light: qrToView.customization?.backgroundColor || '#FFFFFF',
        },
      };

      if (downloadFormat === 'svg') {
        const svgString = await QRCode.toString(trackingUrl, {
          ...options,
          type: 'svg',
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${qrToView.name || 'qr-code'}.svg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For PNG, JPEG, WebP, BMP - use canvas conversion
        const dataUrl = await QRCode.toDataURL(trackingUrl, options);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const mimeType = downloadFormat === 'jpeg' ? 'image/jpeg' : downloadFormat === 'webp' ? 'image/webp' : downloadFormat === 'bmp' ? 'image/bmp' : 'image/png';
            const extension = downloadFormat === 'jpeg' ? 'jpg' : downloadFormat;
            const url = canvas.toDataURL(mimeType, 0.92);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${qrToView.name || 'qr-code'}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        };
        img.src = dataUrl;
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Your QR Codes</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Manage and track all your QR codes.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadQrCodes} size="sm" className="p-2" disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Link href="/dashboard/qrcodes/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create QR Code
                  </Button>
                </Link>
              </div>
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
                          onClick={() => handleView(qr)}
                          className="p-2 text-slate-400 hover:text-brand-600 transition-colors dark:text-slate-500 dark:hover:text-brand-400"
                          title="View QR code"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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

      {/* View QR modal */}
      {viewModalOpen && qrToView && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleViewModalClose}
        >
          <div 
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{qrToView.name || 'QR Code'}</h3>
              <button
                onClick={handleViewModalClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-4">
              {qrImageData ? (
                <img
                  src={qrImageData}
                  alt={qrToView.name || 'QR Code'}
                  className="w-64 h-64 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center">
                  <Loader />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Dropdown
                value={downloadFormat}
                onChange={(value) => setDownloadFormat(value as 'png' | 'svg' | 'jpeg' | 'webp' | 'bmp')}
                options={[
                  { value: 'png', label: 'PNG' },
                  { value: 'jpeg', label: 'JPG' },
                  { value: 'webp', label: 'WebP' },
                  { value: 'bmp', label: 'BMP' },
                  { value: 'svg', label: 'SVG' },
                ]}
                className="w-24"
              />
              <Button
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download {downloadFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
