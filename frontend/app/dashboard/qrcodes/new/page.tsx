'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  FolderTree,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  QrCode,
  Settings,
  User,
  Link as LinkIcon,
  Type,
  Mail,
  Phone,
  Wifi,
  MessageCircle,
  User as UserIcon,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { QrivoIcon } from '@/components/ui/qr-icon';
import { useAuth } from '@/hooks/use-auth';
import { qrApi } from '@/lib/api/qr';
import { foldersApi } from '@/lib/api/folders';
import type { QRContentInput, CreateQRInput, Folder } from '@/types/qr';
import { Input, Label } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils/cn';

export default function NewQRCodePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [qrType, setQrType] = useState<QRContentInput['type']>('URL');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phone, setPhone] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'NOPASS'>('WPA');
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactUrl, setContactUrl] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  
  // Customization state
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [qrPreview, setQrPreview] = useState<string>('');

  const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Sky', value: '#0EA5E9' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Rose', value: '#E11D48' },
    { name: 'Amber', value: '#D97706' },
  ];

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

  useEffect(() => {
    if (user) {
      loadFolders();
    }
  }, [user]);

  // Generate QR preview
  useEffect(() => {
    const generatePreview = async () => {
      let data = '';
      let hasData = false;
      
      switch (qrType) {
        case 'URL':
          if (url.trim()) {
            data = url;
            hasData = true;
          }
          break;
        case 'TEXT':
          if (text.trim()) {
            data = text;
            hasData = true;
          }
          break;
        case 'EMAIL':
          if (email.trim()) {
            data = `mailto:${email}?subject=${encodeURIComponent(emailSubject || '')}&body=${encodeURIComponent(emailBody || '')}`;
            hasData = true;
          }
          break;
        case 'PHONE':
          if (phone.trim()) {
            data = `tel:${phone}`;
            hasData = true;
          }
          break;
        case 'WIFI':
          if (wifiSsid.trim()) {
            data = `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
            hasData = true;
          }
          break;
        case 'WHATSAPP':
          if (waNumber.trim()) {
            data = `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage || '')}`;
            hasData = true;
          }
          break;
        case 'CONTACT':
          if (firstName.trim()) {
            data = `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName}\nFN:${firstName} ${lastName}\nORG:${organization}\nTITLE:${jobTitle}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nURL:${contactUrl}\nADR:;;${contactAddress}\nEND:VCARD`;
            hasData = true;
          }
          break;
        case 'LOCATION':
          if (latitude.trim() && longitude.trim()) {
            data = `geo:${latitude},${longitude}`;
            hasData = true;
          }
          break;
        case 'EVENT':
          if (eventTitle.trim() && eventStart) {
            data = `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${eventStart}\nDTEND:${eventEnd}\nLOCATION:${eventLocation}\nDESCRIPTION:${eventDescription}\nEND:VEVENT`;
            hasData = true;
          }
          break;
      }

      if (hasData && data) {
        try {
          const preview = await QRCode.toDataURL(data, {
            width: 256,
            margin: 2,
            color: {
              dark: foregroundColor,
              light: backgroundColor,
            },
          });
          setQrPreview(preview);
        } catch (err) {
          console.error('Failed to generate QR preview:', err);
        }
      } else {
        setQrPreview('');
      }
    };

    generatePreview();
  }, [qrType, url, text, email, emailSubject, emailBody, phone, wifiSsid, wifiPassword, wifiEncryption, waNumber, waMessage, firstName, lastName, organization, jobTitle, contactEmail, contactPhone, contactUrl, contactAddress, latitude, longitude, eventTitle, eventDescription, eventLocation, eventStart, eventEnd, foregroundColor, backgroundColor]);

  const loadFolders = async () => {
    try {
      const response = await foldersApi.list();
      setFolders(response.folders || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load folders:', error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('QR code name is required');
      return;
    }

    let content: QRContentInput;

    switch (qrType) {
      case 'URL':
        if (!url.trim()) {
          setError('URL is required');
          return;
        }
        content = { type: 'URL', url };
        break;
      case 'TEXT':
        if (!text.trim()) {
          setError('Text is required');
          return;
        }
        content = { type: 'TEXT', text };
        break;
      case 'EMAIL':
        if (!email.trim()) {
          setError('Email is required');
          return;
        }
        content = { type: 'EMAIL', email, emailSubject, emailBody };
        break;
      case 'PHONE':
        if (!phone.trim()) {
          setError('Phone number is required');
          return;
        }
        content = { type: 'PHONE', phone };
        break;
      case 'WIFI':
        if (!wifiSsid.trim()) {
          setError('WiFi SSID is required');
          return;
        }
        content = { type: 'WIFI', wifiSsid, wifiPassword, wifiEncryption, wifiHidden: false };
        break;
      case 'WHATSAPP':
        if (!waNumber.trim()) {
          setError('WhatsApp number is required');
          return;
        }
        content = { type: 'WHATSAPP', waNumber, waMessage };
        break;
      case 'CONTACT':
        if (!firstName.trim()) {
          setError('First name is required');
          return;
        }
        content = {
          type: 'CONTACT',
          firstName,
          lastName,
          organization,
          jobTitle,
          contactEmail,
          contactPhone,
          contactUrl,
          contactAddress,
        };
        break;
      case 'LOCATION':
        if (!latitude.trim() || !longitude.trim()) {
          setError('Latitude and longitude are required');
          return;
        }
        content = { type: 'LOCATION', latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        break;
      case 'EVENT':
        if (!eventTitle.trim() || !eventStart.trim()) {
          setError('Event title and start date are required');
          return;
        }
        content = {
          type: 'EVENT',
          eventTitle,
          eventDescription,
          eventLocation,
          eventStart,
          eventEnd,
        };
        break;
      default:
        setError('Invalid QR type');
        return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateQRInput = {
        name,
        content,
        folderId: selectedFolder,
        expiresAt: expiresAt || undefined,
        customization: {
          foregroundColor,
          backgroundColor,
        },
      };
      await qrApi.create(input);
      router.push('/dashboard/qrcodes');
    } catch (err: any) {
      setError(err.message || 'Failed to create QR code');
    } finally {
      setIsSubmitting(false);
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
            <div className="flex items-center gap-4">
              <Link href="/dashboard/qrcodes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Create QR Code</h1>
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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* QR Code Name */}
                <div>
                  <Label htmlFor="name">QR Code Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My QR Code"
                    required
                  />
                </div>

                {/* QR Type Selection */}
                <div>
                  <Label htmlFor="type">QR Code Type</Label>
                  <Dropdown
                    value={qrType}
                    onChange={(value) => setQrType(value as QRContentInput['type'])}
                    options={[
                      { value: 'URL', label: 'URL', icon: LinkIcon },
                      { value: 'TEXT', label: 'Text', icon: Type },
                      { value: 'EMAIL', label: 'Email', icon: Mail },
                      { value: 'PHONE', label: 'Phone', icon: Phone },
                      { value: 'WIFI', label: 'WiFi', icon: Wifi },
                      { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
                      { value: 'CONTACT', label: 'Contact (vCard)', icon: UserIcon },
                      { value: 'LOCATION', label: 'Location', icon: MapPin },
                      { value: 'EVENT', label: 'Event', icon: Calendar },
                    ]}
                    placeholder="Select QR type"
                  />
                </div>

                {/* Folder Selection */}
                <div>
                  <Label htmlFor="folder">Folder (Optional)</Label>
                  <Dropdown
                    value={selectedFolder || ''}
                    onChange={(value) => setSelectedFolder(value || null)}
                    options={[
                      { value: '', label: 'No Folder' },
                      ...folders.map((folder) => ({ value: folder.id, label: folder.name })),
                    ]}
                    placeholder="Select folder"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Leave empty for QR code that never expires
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700" />

                {/* Dynamic content fields based on type */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {qrType === 'URL' && 'URL Details'}
                    {qrType === 'TEXT' && 'Text Content'}
                    {qrType === 'EMAIL' && 'Email Details'}
                    {qrType === 'PHONE' && 'Phone Number'}
                    {qrType === 'WIFI' && 'WiFi Configuration'}
                    {qrType === 'WHATSAPP' && 'WhatsApp Details'}
                    {qrType === 'CONTACT' && 'Contact Information'}
                    {qrType === 'LOCATION' && 'Location Details'}
                    {qrType === 'EVENT' && 'Event Information'}
                  </h3>
                {qrType === 'URL' && (
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                )}

                {qrType === 'TEXT' && (
                  <div>
                    <Label htmlFor="text">Text</Label>
                    <Input
                      id="text"
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Your text here"
                      required
                    />
                  </div>
                )}

                {qrType === 'EMAIL' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailSubject">Subject (Optional)</Label>
                      <Input
                        id="emailSubject"
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Email subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailBody">Body (Optional)</Label>
                      <Input
                        id="emailBody"
                        type="text"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Email body"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'PHONE' && (
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                )}

                {qrType === 'WIFI' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="wifiSsid">WiFi SSID</Label>
                      <Input
                        id="wifiSsid"
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="Network name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="wifiPassword">Password (Optional)</Label>
                      <Input
                        id="wifiPassword"
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="WiFi password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wifiEncryption">Encryption</Label>
                      <Dropdown
                        value={wifiEncryption}
                        onChange={(value) => setWifiEncryption(value as 'WPA' | 'WEP' | 'NOPASS')}
                        options={[
                          { value: 'WPA', label: 'WPA' },
                          { value: 'WEP', label: 'WEP' },
                          { value: 'NOPASS', label: 'No Password' },
                        ]}
                        placeholder="Select encryption"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'WHATSAPP' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="waNumber">WhatsApp Number</Label>
                      <Input
                        id="waNumber"
                        type="tel"
                        value={waNumber}
                        onChange={(e) => setWaNumber(e.target.value)}
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="waMessage">Message (Optional)</Label>
                      <Input
                        id="waMessage"
                        type="text"
                        value={waMessage}
                        onChange={(e) => setWaMessage(e.target.value)}
                        placeholder="Pre-filled message"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'CONTACT' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Company"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactUrl">Website</Label>
                      <Input
                        id="contactUrl"
                        type="url"
                        value={contactUrl}
                        onChange={(e) => setContactUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactAddress">Address</Label>
                      <Input
                        id="contactAddress"
                        type="text"
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        placeholder="123 Main St, City"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'LOCATION' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="40.7128"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="-74.0060"
                        required
                      />
                    </div>
                  </div>
                )}

                {qrType === 'EVENT' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="eventTitle">Event Title *</Label>
                      <Input
                        id="eventTitle"
                        type="text"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="My Event"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventDescription">Description</Label>
                      <Input
                        id="eventDescription"
                        type="text"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder="Event description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventLocation">Location</Label>
                      <Input
                        id="eventLocation"
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Event venue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventStart">Start Date *</Label>
                      <Input
                        id="eventStart"
                        type="datetime-local"
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventEnd">End Date</Label>
                      <Input
                        id="eventEnd"
                        type="datetime-local"
                        value={eventEnd}
                        onChange={(e) => setEventEnd(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting} size="sm">
                    {isSubmitting ? 'Creating...' : 'Create QR Code'}
                  </Button>
                  <Link href="/dashboard/qrcodes">
                    <Button type="button" variant="outline" size="sm">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column - QR Preview */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 text-center">QR Code Preview</h3>
                  <div className="flex items-center justify-center">
                    {qrPreview ? (
                      <img
                        src={qrPreview}
                        alt="QR Code Preview"
                        className="w-64 h-64 object-contain"
                      />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <QrCode className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    Preview updates as you type
                  </p>

                  {/* QR Code Colors */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Label htmlFor="foregroundColor" className="text-center block">QR Code Color</Label>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center">
                      {COLORS.map(({ name, value }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForegroundColor(value)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all',
                            foregroundColor === value
                              ? 'border-brand-600 ring-2 ring-brand-600/20'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                          )}
                          style={{ backgroundColor: value }}
                          title={name}
                          aria-label={`Select ${name} color`}
                        >
                          {foregroundColor === value && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
                              <span className="h-2 w-2 rounded-full bg-current" style={{ color: value }} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
