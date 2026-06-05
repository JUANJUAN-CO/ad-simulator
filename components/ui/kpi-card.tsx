'use client';

import { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  icon?: string;
  className?: string;
}

export function KpiCard({ label, value, sub, accent, trend, trendValue, icon, className = '' }: KpiCardProps) {
  return (
    <div className={`bg-white rounded border px-3 py-2.5 ${accent ? 'border-l-2 border-l-blue-500' : 'border-slate-200'} ${className}`}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        <div className="text-[10px] text-slate-400">{label}</div>
      </div>
      <div className="text-base font-bold text-slate-800 font-mono mt-0.5">{value}</div>
      <div className="flex items-center gap-1.5 mt-0.5">
        {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
        {trend && (
          <span className={`text-[10px] font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

interface KpiGridProps {
  children: ReactNode;
  cols?: number;
  lgCols?: number;
  className?: string;
}

export function KpiGrid({ children, cols = 3, lgCols = 6, className = '' }: KpiGridProps) {
  return (
    <div className={`grid gap-2 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        ['--tw-lg-cols' as any]: lgCols,
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .grid { grid-template-columns: repeat(${lgCols}, minmax(0, 1fr)); }
        }
      `}</style>
      {children}
    </div>
  );
}
