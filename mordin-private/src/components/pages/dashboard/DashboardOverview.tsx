import { useEffect, useState } from 'react';

import { getDashboardStats, DashboardStats } from '@/services/api/DashboardApi';

const QR_STAGES: {
  key: keyof DashboardStats['qr'];
  label: string;
  color: string;
}[] = [
  { key: 'distributed', label: 'แจกจ่าย', color: '#6c757d' },
  { key: 'collected', label: 'เก็บตัวอย่างแล้ว', color: '#0d6efd' },
  { key: 'received', label: 'รับเข้าแล็บ', color: '#6610f2' },
  { key: 'analyzing', label: 'กำลังวิเคราะห์', color: '#fd7e14' },
  { key: 'analyzed', label: 'วิเคราะห์แล้ว', color: '#198754' },
  { key: 'approved', label: 'อนุมัติแล้ว', color: '#20c997' },
];

const SOIL_COLORS = ['#198754', '#0d6efd', '#fd7e14', '#dc3545', '#6c757d'];

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="private-card mb-4">
        <div className="private-card-body">
          <span className="placeholder-glow">
            <span
              className="placeholder d-block rounded"
              style={{ height: 80 }}
            />
          </span>
        </div>
      </div>
    );
  }
  if (!stats) return null;

  const { qr, soilQuality } = stats;
  const done = qr.analyzed + qr.approved;
  const analyzedPct = qr.total ? Math.round((done / qr.total) * 100) : 0;
  const soilTotal = soilQuality.reduce((s, x) => s + x.count, 0);

  return (
    <div className="mb-4">
      <div className="row g-3">
        {/* QR pipeline */}
        <div className="col-lg-8">
          <div className="private-card h-100">
            <div className="private-card-header d-flex justify-content-between align-items-center">
              <h5 className="private-card-title mb-0">
                ความคืบหน้าตัวอย่าง (QR Code)
              </h5>
              <span className="badge bg-success">
                วิเคราะห์แล้ว {analyzedPct}%
              </span>
            </div>
            <div className="private-card-body">
              <div
                className="progress mb-3"
                style={{ height: 10 }}
                role="progressbar"
                aria-valuenow={analyzedPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${analyzedPct}%` }}
                />
              </div>
              <div className="d-flex flex-wrap gap-3">
                {QR_STAGES.map(stage => (
                  <div key={stage.key} className="text-center">
                    <div
                      className="fw-bold"
                      style={{ fontSize: '1.4rem', color: stage.color }}
                    >
                      {qr[stage.key]}
                    </div>
                    <div className="small text-muted">{stage.label}</div>
                  </div>
                ))}
                <div className="text-center ms-auto">
                  <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                    {qr.total}
                  </div>
                  <div className="small text-muted">QR ทั้งหมด</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Soil quality distribution */}
        <div className="col-lg-4">
          <div className="private-card h-100">
            <div className="private-card-header">
              <h5 className="private-card-title mb-0">คุณภาพดิน (ภาพรวม)</h5>
            </div>
            <div className="private-card-body">
              {soilTotal === 0 ? (
                <p className="text-muted mb-0">ยังไม่มีข้อมูลการจัดเกรดดิน</p>
              ) : (
                soilQuality.map((s, i) => {
                  const pct = Math.round((s.count / soilTotal) * 100);
                  const color = SOIL_COLORS[i % SOIL_COLORS.length];
                  return (
                    <div key={s.name} className="mb-2">
                      <div className="d-flex justify-content-between small">
                        <span>{s.name}</span>
                        <span className="text-muted">
                          {s.count} ({pct}%)
                        </span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
