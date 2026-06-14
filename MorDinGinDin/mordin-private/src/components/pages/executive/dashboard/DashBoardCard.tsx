import { useEffect, useState } from 'react';

import { B_LIST, GenCard1 } from '@/components/gui/GuiButton';
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

export interface DashboardSummaryProps {
  data: SummaryData;
}

const DashboardSummary = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res: FertilizerSummaryResponse =
          await getFertilizerMajorLandScoreSummary();

        // Map API → component’s data structure
        setData({
          totalArea: res.landCount,
          totalFarmers: res.farmerCount,
          totalSamples: res.sampleCount,
          totalWorkingDays: res.serviceCalendarCount,
        });
      } catch (error) {
        console.error('Error loading summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);
  if (loading || !data) return <div>Loading...</div>;
  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon={B_LIST.land.icon}
        num={formatNumber(data.totalArea)}
        name="ไร่"
        desc="พื้นที่วิเคราะห์ดินทั้งหมด"
      />
      <GenCard1
        color="bg-primary"
        icon={B_LIST.farmer.icon}
        num={formatNumber(data.totalFarmers)}
        name="คน"
        desc="จำนวนชาวไร่ทั้งหมด"
      />
      <GenCard1
        color="bg-warning"
        icon="fas fa-bong"
        num={formatNumber(data.totalSamples)}
        name="ตัวอย่าง"
        desc="จำนวนตัวอย่างดินวิเคราะห์ทั้งหมด"
      />
      <GenCard1
        color="bg-success"
        icon="fas fa-calendar-alt"
        num={formatNumber(data.totalWorkingDays)}
        name="วัน"
        desc="จำนวนวันทำงานทั้งหมด"
      />
    </div>
  );
};

export default DashboardSummary;
