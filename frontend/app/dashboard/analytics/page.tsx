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
  TrendingUp,
  User,
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { Dropdown } from '@/components/ui/dropdown';
import { useAuth } from '@/hooks/use-auth';
import { analyticsApi } from '@/lib/api/analytics';
import { qrApi } from '@/lib/api/qr';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [hasQrCodes, setHasQrCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [qrAnalytics, setQrAnalytics] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [browsers, setBrowsers] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [timeseries, setTimeseries] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Load analytics overview
        const analyticsData = await analyticsApi.overview();
        setAnalytics(analyticsData);
        
        // Load QR codes
        const qrData = await qrApi.list({});
        setQrCodes(qrData.items || []);
        setHasQrCodes((qrData.items || []).length > 0);
        
        // Select first QR if available
        if ((qrData.items || []).length > 0) {
          setSelectedQrId(qrData.items[0].id);
          await loadQrAnalytics(qrData.items[0].id);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const loadQrAnalytics = async (qrId: string) => {
    try {
      const [summary, deviceData, browserData, countryData, scansData, timeseriesData] = await Promise.all([
        analyticsApi.summary(qrId),
        analyticsApi.devices(qrId),
        analyticsApi.browsers(qrId),
        analyticsApi.countries(qrId),
        analyticsApi.scans(qrId, 1, 10),
        analyticsApi.timeseries(qrId, 7),
      ]);
      setQrAnalytics(summary);
      setDevices(deviceData || []);
      setBrowsers(browserData || []);
      setCountries(countryData || []);
      setScans(scansData.items || []);
      setTimeseries(timeseriesData || []);
    } catch (error) {
      console.error('Failed to load QR analytics:', error);
    }
  };

  const handleQrSelect = async (qrId: string) => {
    setSelectedQrId(qrId);
    await loadQrAnalytics(qrId);
  };

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
    { icon: QrCode, label: 'QR Codes', href: '/dashboard/qrcodes' },
    { icon: FolderTree, label: 'Folders', href: '/dashboard/folders' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', active: true },
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
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Analytics</h1>
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : (
              <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Scan Analytics</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Track and analyze your QR code performance.</p>
              </div>
              {hasQrCodes && qrCodes.length > 0 && (
                <Dropdown
                  value={selectedQrId || ''}
                  onChange={handleQrSelect}
                  options={qrCodes.map(qr => ({ value: qr.id, label: qr.name }))}
                  className="w-64"
                />
              )}
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Scans</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{analytics?.totalScans || 0}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Unique Scans</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{analytics?.estimatedUniqueScans || 0}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active QRs</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{analytics?.activeQrCodes || 0}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <QrCode className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scans Today</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{analytics?.scansToday || 0}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <FolderTree className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Empty state - only show if no QR codes */}
            {!hasQrCodes && (
              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-12 shadow-card dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-col items-center justify-center text-center">
                  <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">No analytics data yet</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">Create QR codes and start tracking scans to see analytics here.</p>
                  <Link href="/dashboard/qrcodes/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first QR code
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Analytics content - show if has QR codes */}
            {hasQrCodes && analytics && (
              <div className="space-y-6">
                {/* Scan Activity Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Scan Activity (Last 7 Days)</h3>
                  {timeseries && timeseries.length > 0 ? (
                    <div className="h-64 pl-8 pb-8">
                      <div className="relative h-full flex items-end gap-2">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400">
                          {(() => {
                            const max = Math.max(...timeseries.map((p: any) => p.count));
                            const displayMax = max === 0 ? 5 : max; // Default to 5 if all zeros
                            const mid = Math.round(displayMax / 2);
                            return (
                              <>
                                <span>{displayMax}</span>
                                <span>{mid}</span>
                                <span>0</span>
                              </>
                            );
                          })()}
                        </div>
                        {/* Chart bars */}
                        <div className="flex-1 flex items-end gap-2 ml-2">
                          {timeseries.map((point: any, index: number) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-brand-500 rounded-t transition-all hover:bg-brand-600"
                                style={{ height: `${Math.max((point.count / (Math.max(...timeseries.map((p: any) => p.count)) || 1)) * 100, 5)}%` }}
                                title={`${point.date}: ${point.count} scans`}
                              />
                              <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No scan data available yet. Start scanning your QR codes to see activity.</p>
                  )}
                </div>

                {/* Device Breakdown */}
                {devices.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Device Breakdown</h3>
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          {devices.map((device: any, index: number) => {
                            const totalCount = devices.reduce((sum: number, d: any) => sum + (d.count || 0), 0);
                            const count = device.count || 0;
                            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                            const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
                            const offset = devices.slice(0, index).reduce((sum: number, d: any) => {
                              const dCount = d.count || 0;
                              return sum + (totalCount > 0 ? (dCount / totalCount) * 100 : 0);
                            }, 0);
                            return (
                              <circle
                                key={index}
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth="3"
                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                strokeDashoffset={offset}
                              />
                            );
                          })}
                        </svg>
                      </div>
                      <div className="flex-1 space-y-2">
                        {devices.map((device: any, index: number) => {
                          const totalCount = devices.reduce((sum: number, d: any) => sum + (d.count || 0), 0);
                          const count = device.count || 0;
                          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
                          const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                <span className="text-sm text-slate-600 dark:text-slate-400">{device.label || 'Unknown'}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{percentage}% ({count})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : scans.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Device Breakdown</h3>
                    <p className="text-slate-500 dark:text-slate-400">No device breakdown data available yet. Scan data is being collected.</p>
                  </div>
                ) : null}

                {/* Browser Breakdown */}
                {browsers.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Browser Breakdown</h3>
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          {browsers.map((browser: any, index: number) => {
                            const totalCount = browsers.reduce((sum: number, b: any) => sum + (b.count || 0), 0);
                            const count = browser.count || 0;
                            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                            const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
                            const offset = browsers.slice(0, index).reduce((sum: number, b: any) => {
                              const bCount = b.count || 0;
                              return sum + (totalCount > 0 ? (bCount / totalCount) * 100 : 0);
                            }, 0);
                            return (
                              <circle
                                key={index}
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth="3"
                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                strokeDashoffset={offset}
                              />
                            );
                          })}
                        </svg>
                      </div>
                      <div className="flex-1 space-y-2">
                        {browsers.map((browser: any, index: number) => {
                          const totalCount = browsers.reduce((sum: number, b: any) => sum + (b.count || 0), 0);
                          const count = browser.count || 0;
                          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
                          const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                <span className="text-sm text-slate-600 dark:text-slate-400">{browser.label || 'Unknown'}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{percentage}% ({count})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : scans.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Browser Breakdown</h3>
                    <p className="text-slate-500 dark:text-slate-400">No browser breakdown data available yet. Scan data is being collected.</p>
                  </div>
                ) : null}

                {/* Country Breakdown */}
                {countries.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Location Breakdown</h3>
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          {countries.map((country: any, index: number) => {
                            const totalCount = countries.reduce((sum: number, c: any) => sum + (c.count || 0), 0);
                            const count = country.count || 0;
                            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                            const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
                            const offset = countries.slice(0, index).reduce((sum: number, c: any) => {
                              const cCount = c.count || 0;
                              return sum + (totalCount > 0 ? (cCount / totalCount) * 100 : 0);
                            }, 0);
                            return (
                              <circle
                                key={index}
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth="3"
                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                strokeDashoffset={offset}
                              />
                            );
                          })}
                        </svg>
                      </div>
                      <div className="flex-1 space-y-2">
                        {countries.map((country: any, index: number) => {
                          const totalCount = countries.reduce((sum: number, c: any) => sum + (c.count || 0), 0);
                          const count = country.count || 0;
                          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
                          const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                <span className="text-sm text-slate-600 dark:text-slate-400">{country.label || 'Unknown'}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{percentage}% ({count})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : scans.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Location Breakdown</h3>
                    <p className="text-slate-500 dark:text-slate-400">No location breakdown data available yet. Scan data is being collected.</p>
                  </div>
                ) : null}

                {/* Recent Scans Table */}
                {scans.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Recent Scans</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Time</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Device</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Browser</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scans.map((scan: any, index: number) => (
                            <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="py-3 px-4 text-slate-900 dark:text-slate-50">
                                {new Date(scan.scannedAt).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {scan.deviceType || 'Unknown'}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {scan.browser || 'Unknown'}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {scan.country || 'Unknown'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
