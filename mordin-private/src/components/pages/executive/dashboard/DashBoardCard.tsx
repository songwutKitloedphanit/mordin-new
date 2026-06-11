import { useEffect, useState } from 'react';

import {
  FertilizerSummaryResponse,
  getFertilizerMajorLandScoreSummary,
} from '@/services/api/fertilizer/FertilizerMajorLandScore';
import { formatNumber } from '@/utils/Number';

export interface SummaryData {
  totalArea: number;
  totalFarmers: number;
  totalSamples: number;
  totalWorkingDays: number;
}

interface KpiCardProps {
  icon: string;
  num: string;
  unit: string;
  label: string;
  accentColor: string;
  iconBg: string;
}

const KpiCard = ({
  icon,
  num,
  unit,
  label,
  accentColor,
  iconBg,
}: KpiCardProps) => (
  <div className="col-sm-6 col-xl-3">
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
          <span className="exec-kpi-number">{num}</span>
          <span className="exec-kpi-unit">{unit}</span>
        </div>
      </div>
      <div className="exec-kpi-icon">
        <i className={icon} />
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="col-sm-6 col-xl-3">
    <div className="exec-kpi-card-skeleton">
      <div className="placeholder-glow mb-3">
        <span
          className="placeholder d-block rounded"
          style={{ height: 14, width: '60%' }}
        />
      </div>
      <div className="placeholder-glow">
        <span
          className="placeholder d-block rounded"
          style={{ height: 44, width: '50%' }}
        />
      </div>
    </div>
  </div>
);

const DashboardSummary = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res: FertilizerSummaryResponse =
          await getFertilizerMajorLandScoreSummary();
        setData({
          totalArea: res.landCount,
          totalFarmers: res.farmerCount,
          totalSamples: res.sampleCount,
          totalWorkingDays: res.serviceCalendarCount,
        });
      } catch (error) {
        console.error('Error loading summary:', error);
        setError('ไม่สามารถโหลดข้อมูลสรุปได้');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="row mb-4 g-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger mb-4" role="alert">
        <i className="fas fa-circle-exclamation me-2" />
        {error || 'ไม่สามารถโหลดข้อมูลสรุปได้'}
      </div>
    );
  }

  return (
    <div className="row mb-4 g-3">
      <KpiCard
        icon="fas fa-map-marked-alt"
        num={formatNumber(data.totalArea)}
        unit="ไร่"
        label="พื้นที่วิเคราะห์ดินสะสม"
        accentColor="#005092"
        iconBg="rgba(0, 80, 146, 0.08)"
      />
      <KpiCard
        icon="fas fa-users"
        num={formatNumber(data.totalFarmers)}
        unit="คน"
        label="จำนวนชาวไร่ในระบบ"
        accentColor="#2e7d32"
        iconBg="rgba(46, 125, 50, 0.08)"
      />
      <KpiCard
        icon="fas fa-vial"
        num={formatNumber(data.totalSamples)}
        unit="ตัวอย่าง"
        label="ตัวอย่างดินวิเคราะห์แล็บ"
        accentColor="#d97706"
        iconBg="rgba(217, 119, 6, 0.08)"
      />
      <KpiCard
        icon="fas fa-calendar-check"
        num={formatNumber(data.totalWorkingDays)}
        unit="วัน"
        label="จำนวนวันให้บริการสะสม"
        accentColor="#9c6fe4"
        iconBg="rgba(156, 111, 228, 0.08)"
      />
    </div>
  );
};

export default DashboardSummary;
