'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';

const timeline = [
  { d: 'Mon', v: 120 },
  { d: 'Tue', v: 210 },
  { d: 'Wed', v: 180 },
  { d: 'Thu', v: 320 },
  { d: 'Fri', v: 260 },
  { d: 'Sat', v: 390 },
  { d: 'Sun', v: 340 },
];

const devices = [
  { name: 'Mobile', value: 68 },
  { name: 'Desktop', value: 24 },
  { name: 'Tablet', value: 8 },
];

const browsers = [
  { name: 'Chrome', v: 54 },
  { name: 'Safari', v: 28 },
  { name: 'Edge', v: 10 },
  { name: 'Firefox', v: 8 },
];

const PIE_COLORS = ['#4F46E5', '#818cf8', '#c7d2fe'];

export function AnalyticsShowcase() {
  return (
    <section className="section pt-8 sm:pt-2" id="analytics">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mx-auto">Analytics</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
            Understand every scan
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Professional dashboards for scan trends, devices, browsers and locations.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Scan activity</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" className="dark:stroke-slate-500" />
                  <Tooltip />
                  <Area type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={2} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Devices</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={devices} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={2}>
                    {devices.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Top browsers</p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browsers} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" className="dark:stroke-slate-500" />
                  <Tooltip cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }} />
                  <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Unique counts are privacy-conscious estimates, not exact individuals.
        </p>
      </div>
    </section>
  );
}
