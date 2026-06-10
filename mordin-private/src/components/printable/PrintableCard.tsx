import React from 'react';

import Label, { LabelProps } from './Label';

export interface PrintableCardProps {
  labels: LabelProps[];
  rotate?: boolean; // <-- เพิ่ม prop นี้
}

const PrintableCard = ({
  ref,
  labels,
  rotate = false,
}: PrintableCardProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const width = rotate ? '80mm' : '50mm';
  const height = rotate ? '50mm' : '80mm';
  const transform = rotate ? 'rotate(90deg) translate(0, -100%)' : 'none';

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'visible',
        transform,
        transformOrigin: 'top left',
      }}
    >
      {labels.map(l => (
        // ใช้ qrValue เป็น key แทน index (ต้องแน่ใจว่า qrValue ไม่ซ้ำ)
        <Label key={l.qrValue} qrValue={l.qrValue} qrText={l.qrText} />
      ))}
    </div>
  );
};

export default PrintableCard;
