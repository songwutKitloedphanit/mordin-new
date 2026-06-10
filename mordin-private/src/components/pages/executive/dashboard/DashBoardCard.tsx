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
}

const KpiCard = ({ icon, num, unit, label, accentColor }: KpiCardProps) => (
  <div className="col-sm-6 col-lg-3">
    <div
      className="private-metric-card h-100"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="private-card-body py-3 px-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div
              className="text-body-secondary fw-semibold mb-2"
              style={{ fontSize: '1.15rem' }}
            >
              {label}
            </div>
            <div className="d-flex align-items-baseline gap-1">
              <span
                className="fw-bold"
                style={{ fontSize: '3.5rem', lineHeight: 1 }}
              >
                {num}
              </span>
              <span
                className="text-body-secondary"
                style={{ fontSize: '1.25rem' }}
              >
                {unit}
              </span>
            </div>
          </div>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 64,
              height: 64,
              backgroundColor: `${accentColor}1a`,
            }}
          >
            <i
              className={icon}
              style={{ color: accentColor, fontSize: '1.8rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="col-sm-6 col-lg-3">
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
        {error || 'ไม่สามารถโหลดข้อมูลสรุปได้'}
      </div>
    );
  }

  return (
    <div className="row mb-4 g-3">
      <KpiCard
        icon="fas fa-map-marked"
        num={formatNumber(data.totalArea)}
        unit="ไร่"
        label="พื้นที่วิเคราะห์ดินทั้งหมด"
        accentColor="#3b9bd9"
      />
      <KpiCard
        icon="fas fa-user"
        num={formatNumber(data.totalFarmers)}
        unit="คน"
        label="จำนวนชาวไร่ทั้งหมด"
        accentColor="#4caf7d"
      />
      <KpiCard
        icon="fas fa-vial"
        num={formatNumber(data.totalSamples)}
        unit="ตัวอย่าง"
        label="จำนวนตัวอย่างดินวิเคราะห์"
        accentColor="#f4a62a"
      />
      <KpiCard
        icon="fas fa-calendar-alt"
        num={formatNumber(data.totalWorkingDays)}
        unit="วัน"
        label="จำนวนวันทำงานทั้งหมด"
        accentColor="#9c6fe4"
      />
    </div>
  );
};

export default DashboardSummary;

