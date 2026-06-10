import React from 'react';

import Label, { LabelProps } from './Label';

export interface PrintablePageProps {
  labels: LabelProps[];
}

const PrintablePage = ({
  ref,
  labels,
}: PrintablePageProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={ref}
    style={{
      width: '175mm', //ขนาดกระดาษสติ๊กเกอร์จริง 175
      height: '212mm', //ขนาดกระดาษสติ๊กเกอร์จริง 212
      paddingTop: '2mm',
      paddingRight: '2mm',
      paddingBottom: '2mm',
      paddingLeft: '5.60mm', // ✅ ห่างจากขอบซ้าย 5.60mm
      boxSizing: 'border-box',
      display: 'grid',
      // สร้าง 2 คอลัมน์ ขนาดคอลัมน์ละ 80mm ตามความยาว sticker
      gridTemplateColumns: 'repeat(2, 80mm)',
      // ความสูงของแต่ละแถว 50mm ตามความสูง sticker
      gridAutoRows: '50mm',
      // ช่องว่างระหว่างแถว 2.45mm และคอลัมน์ 2mm
      gap: '2.45mm 2mm',
    }}
  >
    {labels.map(l => (
      // ใช้ qrValue เป็น key แทน index (ต้องแน่ใจว่า qrValue ไม่ซ้ำ)
      <Label key={l.qrValue} qrValue={l.qrValue} qrText={l.qrText} />
    ))}
  </div>
);

export default PrintablePage;
