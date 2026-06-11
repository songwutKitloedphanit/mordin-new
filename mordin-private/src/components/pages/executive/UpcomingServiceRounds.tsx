// การ์ด "รอบบริการที่กำลังมาถึง" ท้าย Executive Dashboard (Match-Mockup M5)
// ใช้ endpoint เดิม /service-calendars/upcoming (date >= วันนี้ เรียงใกล้สุดก่อน)
import { useEffect, useState } from 'react';

import EmptyState from '@/components/ui/EmptyState';
import { getUpcomingServiceCalendars } from '@/services/api/ServiceCalendarApi';
import { CalendarInfoInterface } from '@/types/ServiceCalendar';

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

// จำนวนวันจากวันนี้ (เทียบที่เที่ยงคืน เพื่อให้ "วันนี้" = 0 ไม่ขึ้นกับเวลา)
const daysFromToday = (date: Date) => {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  return Math.round((dateStart - todayStart) / 86400000);
};

const UpcomingServiceRounds = () => {
  const [rounds, setRounds] = useState<CalendarInfoInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchUpcoming = async () => {
      try {
        const data = await getUpcomingServiceCalendars();
        if (ignore) return;
        const list: CalendarInfoInterface[] = Array.isArray(data) ? data : [];
        setRounds(
          list
            .filter(item => {
              const date = new Date(item.date);
              return !Number.isNaN(date.getTime()) && daysFromToday(date) >= 0;
            })
            .slice(0, 3)
        );
      } catch (error) {
        console.error('Cannot load upcoming service rounds:', error);
        if (!ignore) setHasError(true);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchUpcoming();

    return () => {
      ignore = true;
    };
  }, []);

  // โหลดไม่สำเร็จ = ไม่แสดงการ์ด (ไม่บังเนื้อหารายงานหลัก)
  if (hasError) return null;

  return (
    <div className="private-card mb-0">
      <div className="private-card-header">
        <h4 className="private-card-title mb-0 d-flex align-items-center">
          <i className="fas fa-calendar-days me-2 text-primary"></i>
          รอบบริการที่กำลังมาถึง
        </h4>
      </div>
      <div className="private-card-body d-flex flex-column gap-2">
        {isLoading ? (
          <div className="placeholder-glow" aria-hidden="true">
            {[0, 1, 2].map(index => (
              <span
                key={index}
                className="placeholder col-12 d-block mb-2"
                style={{ height: '54px', borderRadius: '10px' }}
              ></span>
            ))}
          </div>
        ) : rounds.length === 0 ? (
          <EmptyState title="ไม่มีรอบบริการที่กำลังมาถึง" />
        ) : (
          rounds.map(round => {
            const date = new Date(round.date);
            const daysLeft = daysFromToday(date);
            const tone =
              daysLeft <= 7 ? 'red' : daysLeft <= 14 ? 'blue' : 'gray';

            const subdistrict = round.subdistrict;
            const locality = [
              subdistrict?.nameTh ? `ต.${subdistrict.nameTh}` : '',
              subdistrict?.district?.nameTh
                ? `อ.${subdistrict.district.nameTh}`
                : '',
            ]
              .filter(Boolean)
              .join(' ');
            const mainText = locality
              ? `ออกหน่วยบริการ ${locality}`
              : round.description || 'รอบออกหน่วยบริการ';

            const bus = round.bus;
            const subText = [
              subdistrict?.district?.province?.nameTh
                ? `จ.${subdistrict.district.province.nameTh}`
                : '',
              round.village || '',
              bus
                ? `รถ ${bus.busName || bus.busNumber}${
                    bus.licensePlate ? ` (${bus.licensePlate})` : ''
                  }`
                : '',
              round.numberOfSamples
                ? `เป้า ${round.numberOfSamples.toLocaleString()} ตัวอย่าง`
                : '',
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <div key={round.serviceCalendarId} className="exec-upcoming-item">
                <div className={`exec-upcoming-date is-${tone}`}>
                  <div className="exec-upcoming-month">
                    {THAI_MONTHS_SHORT[date.getMonth()]}
                  </div>
                  <div className="exec-upcoming-day">
                    {String(date.getDate()).padStart(2, '0')}
                  </div>
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="exec-upcoming-main">{mainText}</div>
                  {subText && (
                    <div className="exec-upcoming-sub">{subText}</div>
                  )}
                </div>
                <span
                  className={`private-chip private-chip-${tone} flex-shrink-0`}
                >
                  {daysLeft === 0 ? 'วันนี้' : `อีก ${daysLeft} วัน`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingServiceRounds;
