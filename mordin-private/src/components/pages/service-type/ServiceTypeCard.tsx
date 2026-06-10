import { useEffect, useState } from 'react';

import { getServiceTypeSummary } from '@/services/api/service-type/ServiceTypeApi';
import { ServiceTypeSummary } from '@/types/service-type/ServiceTypes';

const KPI_CONFIG: {
  key: keyof ServiceTypeSummary;
  label: string;
  unit: string;
  icon: string;
  accent: string;
}[] = [
  {
    key: 'totalServiceTypes',
    label: 'ประเภทการให้บริการ',
    unit: 'ประเภท',
    icon: 'fas fa-layer-group',
    accent: '#3b9bd9',
  },
  {
    key: 'totalServiceLaboratories',
    label: 'ประเภทการประเมิน',
    unit: 'รายการ',
    icon: 'fas fa-flask',
    accent: '#17a2b8',
  },
];

export default function ServiceTypeCard() {
  const [summary, setSummary] = useState<ServiceTypeSummary | null>(null);

  useEffect(() => {
    getServiceTypeSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="row g-3 mb-4">
      {KPI_CONFIG.map(cfg => (
        <div key={cfg.key} className="col-sm-6">
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
                        {cfg.unit}
                      </span>
                    </div>
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

