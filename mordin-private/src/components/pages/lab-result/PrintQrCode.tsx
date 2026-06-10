import { QRCodeSVG } from 'qrcode.react';
import React, { FC, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { LabelProps } from '@/components/printable/Label';

const mm = (n: number) => `${n}mm`;

const Label: FC<LabelProps> = ({ qrValue, qrText }) => {
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
      <QRCodeSVG value={qrValue} size={100} />
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
  const printKeyRef = useRef('');
  const printTimerRef = useRef<number | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `qrcode_${Date.now()}`,
    pageStyle: `
      @page { size: 80mm 50mm; margin: 0; }
      html, body {
        width: 80mm;
        height: 50mm;
        margin: 0;
      }
      .page {
        width: 80mm;
        height: 50mm;
        display: flex;
        justify-content: center;
        align-items: center;
        break-after: page;
        page-break-after: always;
      }
      .page:last-child {
        break-after: auto;
        page-break-after: auto;
      }
    `,
    onBeforePrint: () =>
      new Promise<void>(resolve => requestAnimationFrame(() => resolve())),
    onAfterPrint: () => {
      printKeyRef.current = '';
      onClose();
    },
  });

  useEffect(() => {
    if (labels.length === 0) {
      return;
    }

    const printKey = labels.map(label => label.qrValue).join('|');
    if (printKeyRef.current === printKey) {
      return;
    }

    printKeyRef.current = printKey;
    printTimerRef.current = window.setTimeout(() => {
      printTimerRef.current = null;
      handlePrint();
    }, 150);

    return () => {
      if (printTimerRef.current !== null) {
        window.clearTimeout(printTimerRef.current);
        printTimerRef.current = null;
        if (printKeyRef.current === printKey) {
          printKeyRef.current = '';
        }
      }
    };
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
