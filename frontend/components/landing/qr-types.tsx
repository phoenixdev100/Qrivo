import {
  CalendarClock,
  Contact,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Type,
  Wifi,
} from 'lucide-react';

const types = [
  { icon: Link2, label: 'URL' },
  { icon: Type, label: 'Text' },
  { icon: Mail, label: 'Email' },
  { icon: Phone, label: 'Phone' },
  { icon: Wifi, label: 'WiFi' },
  { icon: MessageCircle, label: 'WhatsApp' },
  { icon: Contact, label: 'Contact' },
  { icon: MapPin, label: 'Location' },
  { icon: CalendarClock, label: 'Event' },
];

export function QrTypes() {
  return (
    <section className="section bg-slate-50" id="qr-types">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mx-auto">QR types</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            One platform, nine QR types
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From simple links to WiFi, contacts and calendar events - all trackable.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 sm:grid-cols-3 lg:grid-cols-9">
          {types.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition-colors hover:border-brand-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
