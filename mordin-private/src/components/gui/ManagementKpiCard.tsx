/**
 * Shared KPI card component for all management list pages.
 * Replaces the old `private-metric-card` inline pattern
 * with the new premium `exec-kpi-card` style.
 */

import React from 'react';

export interface KpiConfig<T extends string | symbol = string> {
  key: T;
  label: string;
  icon: string;
  accentColor: string;
  unit?: string;
}

interface ManagementKpiCardProps {
  label: string;
  value: number | string;
  icon: string;
  accentColor: string;
  unit?: string;
  loading?: boolean;
}

export const ManagementKpiCard = ({
  label,
  value,
  icon,
  accentColor,
  unit = '',
  loading = false,
}: ManagementKpiCardProps) => {
  if (loading) {
    return (
      <div
        className="exec-kpi-card-skeleton h-100"
        style={
          { '--kpi-accent': 'rgba(128,128,128,0.2)' } as React.CSSProperties
        }
      >
        <div className="placeholder-glow mb-3">
          <span
            className="placeholder d-block rounded"
            style={{ height: 13, width: '58%' }}
          />
        </div>
        <div className="placeholder-glow">
          <span
            className="placeholder d-block rounded"
            style={{ height: 42, width: '46%' }}
          />
        </div>
      </div>
    );
  }

  const iconBg = `${accentColor}1a`;

  return (
    <div
      className="exec-kpi-card h-100"
      style={
        {
          '--kpi-accent': accentColor,
          '--kpi-icon-bg': iconBg,
        } as React.CSSProperties
      }
    >
      <div>
        <div className="exec-kpi-label">{label}</div>
        <div className="exec-kpi-value-group">
          <span className="exec-kpi-number">{value}</span>
          {unit && <span className="exec-kpi-unit">{unit}</span>}
        </div>
      </div>
      <div className="exec-kpi-icon">
        <i className={icon} />
      </div>
    </div>
  );
};

/**
 * Renders a row of KPI cards (row g-3 mb-4) for a management list page.
 * Pass `colClass` to override column width (default: col-sm-6 col-lg-3).
 */
interface ManagementKpiRowProps<T extends string> {
  configs: KpiConfig<T>[];
  data: Record<T, number | string> | null;
  loading: boolean;
  colClass?: string;
}

export function ManagementKpiRow<T extends string>({
  configs,
  data,
  loading,
  colClass = 'col-sm-6 col-lg-3',
}: ManagementKpiRowProps<T>) {
  return (
    <div className="row g-3 mb-4">
      {configs.map(cfg => (
        <div key={String(cfg.key)} className={colClass}>
          <ManagementKpiCard
            label={cfg.label}
            value={data?.[cfg.key] ?? 0}
            icon={cfg.icon}
            accentColor={cfg.accentColor}
            unit={cfg.unit}
            loading={loading}
          />
        </div>
      ))}
    </div>
  );
}

export default ManagementKpiCard;
