'use client';

import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getQrCodeSummary } from '@/services/api/qr-code/QrCodeApi';
import { QrCodeSummary } from '@/types/qr-code/QrCode';

const QRCodeSummaryCard = () => {
  const [summary, setSummary] = useState<QrCodeSummary>({
    total: 0,
    distributed: 0,
    reserved: 0,
    completed: 0,
  });

  useEffect(() => {
    getQrCodeSummary().then(setSummary).catch(console.error);
  }, []);

  const available = summary.total - summary.reserved;
  const percent = (value: number) =>
    summary.total === 0 ? 0 : ((value / summary.total) * 100).toFixed(2);

  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon="fas fa-qrcode"
        num={summary.total}
        name="ตัวอย่าง"
        desc="QR code ตัวอย่างทั้งหมด"
      />
      <GenCard1
        color="bg-warning"
        icon="fas fa-bong"
        num={available}
        name="QR code ว่าง"
        desc={`QR code ว่าง ${available}/${summary.total} = ${percent(available)}%`}
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-bong"
        num={summary.reserved}
        name="จองวิเคราะห์"
        desc={`จองวิเคราะห์ ${summary.reserved}/${summary.total} = ${percent(summary.reserved)}%`}
      />
      <GenCard1
        color="bg-success"
        icon="fas fa-bong"
        num={summary.completed}
        name="วิเคราะห์แล้ว"
        desc={`วิเคราะห์แล้ว ${summary.completed}/${summary.total} = ${percent(summary.completed)}%`}
      />
    </div>
  );
};

export default QRCodeSummaryCard;
