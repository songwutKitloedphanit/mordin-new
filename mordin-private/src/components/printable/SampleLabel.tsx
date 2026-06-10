import { QRCodeCanvas } from 'qrcode.react';
import { FC } from 'react';

export interface SampleLabelProps {
  qrValue: string;
  sampleCode: string;
  receivedDate: string;
  sequence: number;
}

const mm = (n: number) => `${n}mm`;

const SampleLabel: FC<SampleLabelProps> = ({
  qrValue,
  sampleCode,
  // receivedDate,
  // sequence,
}) => {
  return (
    <div
      style={{
        width: mm(50),
        height: mm(50),
        padding: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        // border: '1px dotted #000',
        fontFamily: 'sans-serif',
        fontSize: '12pt',
        lineHeight: 1.25,
      }}
    >
      {/* QR Code */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: mm(1),
          marginBottom: mm(0),
        }}
      >
        <QRCodeCanvas value={qrValue} size={150} />
      </div>

      {/* ข้อมูลตัวอย่าง */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: mm(1),
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: mm(0.5),
            alignItems: 'center',
          }}
        >
          {/* <span style={{ whiteSpace: 'nowrap' }}>รหัสตัวอย่าง</span> */}
          <span style={{ fontSize: '14pt', fontWeight: 'bold' }}>
            {sampleCode}
          </span>
        </div>
        {/* <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: mm(0.5),
            alignItems: 'center',
          }}
        >
          <span>วันที่รับ</span>
          <span>{receivedDate}</span>
        </div> */}
        {/* <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ whiteSpace: 'nowrap' }}>ลำดับ</span>
          <span style={{ marginLeft: mm(2) }}>{sequence}</span>
        </div> */}
      </div>
    </div>
  );
};

export default SampleLabel;
