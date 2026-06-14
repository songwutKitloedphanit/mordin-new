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
  note: string;
  accentColor: string;
}

// การ์ด KPI ดีไซน์ใหม่: แถบสีเน้นซ้าย ตัวเลขใหญ่ font Inter พร้อมบรรทัดบริบทใต้ตัวเลข
const KpiCard = ({
  icon,
  num,
  unit,
  label,
  note,
  accentColor,
}: KpiCardProps) => (
  <div
    className="exr-kpi"
    style={{ '--kpi-c': accentColor } as React.CSSProperties}
  >
    <div className="exr-kpi-top">
      <span className="exr-kpi-label">{label}</span>
      <span className="exr-kpi-ic">
        <i className={icon} />
      </span>
    </div>
    <div>
      <div className="exr-kpi-num">
        {num}
        <small>{unit}</small>
      </div>
      <div className="exr-kpi-trend">{note}</div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="exr-kpi">
    <div className="placeholder-glow mb-3">
      <span
        className="placeholder d-block rounded"
        style={{ height: 14, width: '60%' }}
      />
    </div>
    <div className="placeholder-glow">
      <span
        className="placeholder d-block rounded"
        style={{ height: 36, width: '50%' }}
      />
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
      } catch (error: any) {
        console.error('Error loading summary:', error);
        const serverError = error?.response?.data?.error || error?.response?.data?.message || error?.message || '';
        setError(`ไม่สามารถโหลดข้อมูลสรุปได้: ${serverError}`);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="exr-kpis">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger mb-0" role="alert">
        <i className="fas fa-circle-exclamation me-2" />
        {error || 'ไม่สามารถโหลดข้อมูลสรุปได้'}
      </div>
    );
  }

  return (
    <div className="exr-kpis">
      <KpiCard
        icon="fas fa-map-location-dot"
        num={formatNumber(data.totalArea)}
        unit="ไร่"
        label="พื้นที่วิเคราะห์ดินสะสม"
        note="รวมทุกพื้นที่ให้บริการ"
        accentColor="#005092"
      />
      <KpiCard
        icon="fas fa-users"
        num={formatNumber(data.totalFarmers)}
        unit="คน"
        label="ชาวไร่ในระบบสะสม"
        note="ลงทะเบียนรับบริการวิเคราะห์ดิน"
        accentColor="#18a05c"
      />
      <KpiCard
        icon="fas fa-vial"
        num={formatNumber(data.totalSamples)}
        unit="ตัวอย่าง"
        label="ตัวอย่างดินตรวจวิเคราะห์"
        note="ผ่านการวิเคราะห์ในห้องแล็บ"
        accentColor="#d98f0c"
      />
      <KpiCard
        icon="fas fa-calendar-check"
        num={formatNumber(data.totalWorkingDays)}
        unit="วัน"
        label="วันออกปฏิบัติงานจริง"
        note="วันให้บริการสะสมทั้งหมด"
        accentColor="#7a5af5"
      />
    </div>
  );
};

export default DashboardSummary;
