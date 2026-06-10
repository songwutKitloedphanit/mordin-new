import { useEffect, useState } from 'react';

import { getServiceCalendarSummary } from '@/services/api/ServiceCalendarApi';
import { ServiceCalendarSummary } from '@/types/ServiceCalendar';

interface ServiceCalendarCardProps {
  year?: number;
  month?: number;
}

const KPI_CONFIG: {
  key: keyof ServiceCalendarSummary;
  label: string;
  icon: string;
  accent: string;
}[] = [
  {
    key: 'totalSamples',
    label: 'ทั้งหมด',
    icon: 'fas fa-vial',
    accent: '#6c757d',
  },
  {
    key: 'remaining',
    label: 'ว่าง',
    icon: 'fas fa-hourglass-half',
    accent: '#F39C12',
  },
  {
    key: 'totalBookings',
    label: 'จองวิเคราะห์',
    icon: 'fas fa-bookmark',
    accent: '#3b9bd9',
  },
  {
    key: 'analyzed',
    label: 'วิเคราะห์แล้ว',
    icon: 'fas fa-check-circle',
    accent: '#31CE36',
  },
];

export default function ServiceCalendarCard({
  year,
  month,
}: ServiceCalendarCardProps) {
  const [summary, setSummary] = useState<ServiceCalendarSummary | null>(null);

  useEffect(() => {
    setSummary(null);
    getServiceCalendarSummary(year, month)
      .then(setSummary)
      .catch(console.error);
  }, [year, month]);

  const getPercent = (x: number, total: number) => {
    if (total === 0) return null;
    return ((x / total) * 100).toFixed(1);
  };

  return (
    <div className="row g-3 mb-4">
      {KPI_CONFIG.map(cfg => (
        <div key={cfg.key} className="col-sm-6 col-lg-3">
          {summary === null ? (
            <div
              className="private-metric-card h-100"
              style={{ borderLeft: '4px solid rgba(128,128,128,0.2)' }}
            >
              <div className="private-card-body py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="flex-fill">
                    <div className="placeholder-glow mb-2">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 11, width: '55%' }}
                      />
                    </div>
                    <div className="placeholder-glow">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 40, width: '45%' }}
                      />
                    </div>
                  </div>
                  <div
                    className="rounded-circle flex-shrink-0"
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'rgba(128,128,128,0.1)',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              className="private-metric-card h-100"
              style={{ borderLeft: `4px solid ${cfg.accent}` }}
            >
              <div className="private-card-body py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div
                      className="text-muted fw-semibold text-uppercase mb-2"
                      style={{ fontSize: '0.85rem', letterSpacing: '0.6px' }}
                    >
                      {cfg.label}
                    </div>
                    <div className="d-flex align-items-baseline gap-1">
                      <span
                        className="fw-bold"
                        style={{ fontSize: '3.5rem', lineHeight: 1 }}
                      >
                        {summary[cfg.key]}
                      </span>
                      <span
                        className="text-muted"
                        style={{ fontSize: '1rem' }}
                      >
                        ราย
                      </span>
                    </div>
                    {cfg.key !== 'totalSamples' &&
                      getPercent(
                        summary[cfg.key] as number,
                        summary.totalSamples
                      ) !== null && (
                        <div
                          className="text-muted mt-2"
                          style={{ fontSize: '0.87rem' }}
                        >
                          {getPercent(
                            summary[cfg.key] as number,
                            summary.totalSamples
                          )}
                          % จากทั้งหมด
                        </div>
                      )}
                  </div>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: `${cfg.accent}1a`,
                    }}
                  >
                    <i
                      className={cfg.icon}
                      style={{ color: cfg.accent, fontSize: '1.8rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

