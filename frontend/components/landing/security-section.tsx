import { CheckCircle2, ShieldCheck } from 'lucide-react';

const points = [
  'URL validation blocks javascript:, data: and unsafe protocols',
  'Passwords hashed with bcrypt; secure httpOnly session cookies',
  'Rate limiting on auth, creation and public scan endpoints',
  'No raw IP addresses stored - only privacy-safe scan hashes',
  'Input validated with strict schemas on every request',
  'Role-based access control for admin operations',
];

export function SecuritySection() {
  return (
    <section className="section" id="security">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="eyebrow">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            Security
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built with security and privacy in mind
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            FreeQR treats every redirect and scan as untrusted input, validating and protecting
            data at every layer.
          </p>
        </div>

        <ul className="grid gap-3">
          {points.map((p) => (
            <li
              key={p}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span className="text-sm text-slate-700">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
