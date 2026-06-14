import { QRCodeCanvas } from 'qrcode.react';
import React, { FC, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { LabelProps } from '@/components/printable/Label';

const mm = (n: number) => `${n}mm`;

const Label: FC<LabelProps> = ({ qrValue, qrText }) => {
  console.log('📦 QR Label:', { qrValue, qrText });
  return (
    <div
      style={{
        width: mm(80),
        height: mm(50),
        padding: mm(2),
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px dotted #000',
        fontFamily: 'sans-serif',
        fontSize: '10pt',
        lineHeight: 1.25,
      }}
    >
      <QRCodeCanvas value={qrValue} size={100} />
      <span style={{ marginTop: mm(1), textAlign: 'center', fontSize: '14pt' }}>
        {qrText}
      </span>
    </div>
  );
};

interface PrintQrCodeProps {
  labels: LabelProps[];
  onClose: () => void;
}

const PrintQrCode: React.FC<PrintQrCodeProps> = ({ labels, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `qrcode_${Date.now()}`,
    pageStyle: `
      @page { size: 80mm 50mm; margin: 0; }
      body { margin: 0; }
      .page { 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        min-height: 100vh; 
        page-break-after: always;
      }
    `,
    onAfterPrint: () => {
      onClose();
    },
  });

  useEffect(() => {
    if (labels.length > 0) {
      handlePrint();
    }
  }, [handlePrint, labels]);

  return (
    <div ref={printRef}>
      {labels.map(label => (
        <div key={label.qrValue} className="page">
          <Label qrValue={label.qrValue} qrText={label.qrText} />
        </div>
      ))}
    </div>
  );
};

export default PrintQrCode;
