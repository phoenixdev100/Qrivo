'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  ChevronDown,
  Folder,
  FolderTree,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Plus,
  QrCode,
  Search,
  Settings,
  User,
  X,
  PlusCircle,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { Dropdown } from '@/components/ui/dropdown';
import { useAuth } from '@/hooks/use-auth';
import { foldersApi } from '@/lib/api/folders';
import { qrApi } from '@/lib/api/qr';

export default function FoldersPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddQrModalOpen, setIsAddQrModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingQr, setIsAddingQr] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableQrCodes, setAvailableQrCodes] = useState<any[]>([]);
  const [selectedQrCodes, setSelectedQrCodes] = useState<string[]>([]);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<any>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<any>(null);
  const folderMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadFolders = async () => {
      if (!user) return;
      try {
        const response = await foldersApi.list();
        setFolders(response.folders || []);
      } catch (error) {
        console.error('Failed to load folders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFolders();
  }, [user]);

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (folderMenuRef.current && !folderMenuRef.current.contains(event.target as Node)) {
        setFolderMenuOpen(null);
      }
    };

    if (userDropdownOpen || folderMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userDropdownOpen, folderMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreating(true);
    try {
      const response = await foldersApi.create(newFolderName);
      setFolders([...folders, response.folder]);
      setNewFolderName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenCreateModal = () => {
    setNewFolderName('');
    setIsCreateModalOpen(true);
  };

  const handleOpenAddQrModal = async (folder: any) => {
    setSelectedFolder(folder);
    setIsAddQrModalOpen(true);
    try {
      const response = await qrApi.list();
      // Filter to only show QR codes not in any folder
      setAvailableQrCodes((response.items || []).filter(qr => !qr.folderId));
    } catch (error) {
      console.error('Failed to load QR codes:', error);
    }
  };

  const handleAddQrToFolder = async () => {
    if (!selectedFolder || selectedQrCodes.length === 0) return;
    setIsAddingQr(true);
    try {
      await Promise.all(
        selectedQrCodes.map(qrId => qrApi.update(qrId, { folderId: selectedFolder.id }))
      );
      // Refresh folders to update QR counts
      const response = await foldersApi.list();
      setFolders(response.folders || []);
      // Also reload available QR codes to remove the ones that were added
      const qrResponse = await qrApi.list();
      // Filter to only show QR codes not in any folder
      setAvailableQrCodes((qrResponse.items || []).filter(qr => !qr.folderId));
      setSelectedQrCodes([]);
      setIsAddQrModalOpen(false);
    } catch (error) {
      console.error('Failed to add QR codes to folder:', error);
    } finally {
      setIsAddingQr(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !renameFolderName.trim()) return;
    setIsRenaming(true);
    try {
      await foldersApi.update(folderToRename.id, renameFolderName);
      // Refresh folders
      const response = await foldersApi.list();
      setFolders(response.folders || []);
      setRenameFolderName('');
      setFolderToRename(null);
      setIsRenameModalOpen(false);
    } catch (error) {
      console.error('Failed to rename folder:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    setIsDeleting(true);
    try {
      await foldersApi.remove(folderId);
      // Refresh folders
      const response = await foldersApi.list();
      setFolders(response.folders || []);
      setIsDeleteModalOpen(false);
      setFolderToDelete(null);
      setFolderMenuOpen(null);
    } catch (error) {
      console.error('Failed to delete folder:', error);
    } finally {
      setIsDeleting(false);
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
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Folders</h1>
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Your Folders</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Organize your QR codes into folders.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button size="sm" onClick={handleOpenCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Folder
                </Button>
              </div>
            </div>

            {/* Folders list */}
            {filteredFolders.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                    onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-slate-900 dark:text-slate-50">{folder.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{folder.qrCodeCount || 0} QR codes</p>
                        </div>
                      </div>
                      <div className="relative" ref={folderMenuRef}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderMenuOpen(folderMenuOpen === folder.id ? null : folder.id);
                          }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {folderMenuOpen === folder.id && (
                          <div className="absolute right-0 mt-2 w-auto min-w-[120px] rounded-lg border border-slate-200 bg-white shadow-lg py-1 dark:border-slate-700 dark:bg-slate-900 z-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderToRename(folder);
                                setRenameFolderName(folder.name);
                                setIsRenameModalOpen(true);
                                setFolderMenuOpen(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              <Edit className="h-4 w-4" />
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddQrModal(folder);
                                setFolderMenuOpen(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              <PlusCircle className="h-4 w-4" />
                              Add QRs
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderToDelete(folder);
                                setIsDeleteModalOpen(true);
                                setFolderMenuOpen(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
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
                  <Folder className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">No folders yet</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">Create folders to organize your QR codes by campaign or category.</p>
                  <Button size="sm" className="mt-4" onClick={handleOpenCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first folder
                  </Button>
                </div>
              </div>
            )}

            {/* Add QR to folder modal */}
            {isAddQrModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Add QR Codes to {selectedFolder?.name}
                    </h3>
                    <button
                      onClick={() => setIsAddQrModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {availableQrCodes.length > 0 ? (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Select QR Codes
                        </label>
                        <Dropdown
                          value={selectedQrCodes.join(',')}
                          onChange={(value) => setSelectedQrCodes(value.split(','))}
                          options={availableQrCodes.map(qr => ({ value: qr.id, label: qr.name }))}
                          placeholder="Select QR codes to add"
                          multiple
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                        No QR codes available to add
                      </p>
                    )}
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddQrModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddQrToFolder} disabled={selectedQrCodes.length === 0 || isAddingQr}>
                        {isAddingQr ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          `Add Selected (${selectedQrCodes.length})`
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete folder modal */}
            {isDeleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete Folder</h3>
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                      Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-50">{folderToDelete?.name}</span>? QR codes in this folder will not be deleted.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleDeleteFolder(folderToDelete.id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rename folder modal */}
            {isRenameModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Rename Folder</h3>
                    <button
                      onClick={() => setIsRenameModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Folder Name
                      </label>
                      <input
                        type="text"
                        value={renameFolderName}
                        onChange={(e) => setRenameFolderName(e.target.value)}
                        placeholder="Enter folder name"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                        onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder()}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsRenameModalOpen(false)}
                        disabled={isRenaming}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleRenameFolder} disabled={isRenaming || !renameFolderName.trim()}>
                        {isRenaming ? 'Renaming...' : 'Rename'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create folder modal */}
            {isCreateModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Create New Folder</h3>
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Folder Name
                      </label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(false)}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFolder} disabled={isCreating || !newFolderName.trim()}>
                        {isCreating ? 'Creating...' : 'Create Folder'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
