import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getServiceCalendarSummary } from '@/services/api/ServiceCalendarApi';
import { ServiceCalendarSummary } from '@/types/ServiceCalendar';

interface ServiceCalendarCardProps {
  year?: number;
  month?: number;
}

// 1. รับ props year และ month เข้ามาใน Component
export default function ServiceCalendarCard({
  year,
  month,
}: ServiceCalendarCardProps) {
  const [summary, setSummary] = useState<ServiceCalendarSummary>({
    totalSamples: 0,
    remaining: 0,
    totalBookings: 0,
    analyzed: 0,
  });

  // 2. เพิ่ม year และ month ใน dependency array
  useEffect(() => {
    // ส่ง year, month ไปที่ API
    getServiceCalendarSummary(year, month).then(setSummary);
  }, [year, month]); // <-- ทำงานใหม่เมื่อปีหรือเดือนเปลี่ยน

  const { totalSamples, remaining, totalBookings, analyzed } = summary;

  // 3. ฟังก์ชันคำนวณ % (ป้องกันการหารด้วย 0)
  const getPercent = (x: number, all: number) => {
    if (all === 0) return '0.0';
    return ((x / all) * 100).toFixed(1);
  };

  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon="fas fa-calendar-alt"
        num={totalSamples}
        name="ทั้งหมด"
        desc="จำนวนตัวอย่างทั้งหมด"
      />
      <GenCard1
        color="bg-warning"
        icon="fas fa-calendar-alt"
        num={remaining}
        name="ว่าง"
        // 4. แสดงผล % ตามสูตร: ค่า / ทั้งหมด
        desc={`ว่าง ${remaining}/${totalSamples} = ${getPercent(remaining, totalSamples)}%`}
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-calendar-alt"
        num={totalBookings}
        name="จองวิเคราะห์"
        desc={`จองวิเคราะห์ ${totalBookings}/${totalSamples} = ${getPercent(totalBookings, totalSamples)}%`}
      />
      <GenCard1
        color="bg-success"
        icon="fas fa-calendar-alt"
        num={analyzed}
        name="วิเคราะห์แล้ว"
        desc={`วิเคราะห์แล้ว ${analyzed}/${totalSamples} = ${getPercent(analyzed, totalSamples)}%`}
      />
    </div>
  );
}
