'use client';

import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { GenCard1Skeleton } from '@/components/gui/Skeleton';
import { searchQrCode } from '@/services/api/qr-code/QrCodeApi';
import { QrCodeInfo } from '@/types/qr-code/QrCode';

interface OfficerQRCodeSummaryCardProps {
  serviceCalendarId?: number;
}

const OfficerQRCodeSummaryCard = ({
  serviceCalendarId,
}: OfficerQRCodeSummaryCardProps) => {
  const [qrCodes, setQrCodes] = useState<QrCodeInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceCalendarId) {
      setQrCodes([]);
      return;
    }

    const fetchQrCodes = async () => {
      setLoading(true);
      try {
        const response = await searchQrCode({
          serviceCalendarId,
          page: 1,
          limit: 9999, // ดึงข้อมูลทั้งหมดที่ตรงกับ serviceCalendarId
        });
        setQrCodes(response.data);
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        setQrCodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCodes();
  }, [serviceCalendarId]);

  // คำนวณสถิติจากข้อมูลที่ fetch มา
  const total = qrCodes.length;
  const reserved = qrCodes.filter(
    qr => qr.book !== null && qr.book !== undefined
  ).length;
  const completed = qrCodes.filter(
    qr => qr.book?.results && qr.book.results.length > 0
  ).length;
  const available = total - reserved;

  const percent = (value: number) =>
    total === 0 ? 0 : ((value / total) * 100).toFixed(2);

  if (loading) {
    return (
      <div className="row">
        {[1, 2, 3, 4].map(i => (
          <GenCard1Skeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon="fas fa-qrcode"
        num={total}
        name="ตัวอย่าง"
        desc="QR code ตัวอย่างทั้งหมด"
      />
      <GenCard1
        color="bg-warning"
        icon="fas fa-bong"
        num={available}
        name="QR code ว่าง"
        desc={`QR code ว่าง ${available}/${total} = ${percent(available)}%`}
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-bong"
        num={reserved}
        name="จองวิเคราะห์"
        desc={`จองวิเคราะห์ ${reserved}/${total} = ${percent(reserved)}%`}
      />
      <GenCard1
        color="bg-success"
        icon="fas fa-bong"
        num={completed}
        name="วิเคราะห์แล้ว"
        desc={`วิเคราะห์แล้ว ${completed}/${total} = ${percent(completed)}%`}
      />
    </div>
  );
};

export default OfficerQRCodeSummaryCard;
