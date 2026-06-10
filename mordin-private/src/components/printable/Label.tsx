import { QRCodeCanvas } from 'qrcode.react';
import { FC } from 'react';

export interface LabelProps {
  qrValue: string;
  qrText: string;
}

const mm = (n: number) => `${n}mm`;
const LINE_GAP_MM = 1.5;
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
        justifyContent: 'flex-start',
        border: '1px dotted #000',
        fontFamily: 'sans-serif',
        fontSize: '10pt',
        lineHeight: 1.25,
      }}
    >
      <div style={{ display: 'flex', marginBottom: 0 }}>
        {/* ส่วนที่ 1 คือช่องกรอกข้อมูลส่วนตัวของชาวไร่ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {['ชื่อชาวไร่', 'เบอร์ติดต่อ', 'หมายเลขแปลง', 'ชื่อตัวอย่าง'].map(
            text => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  marginBottom: mm(LINE_GAP_MM),
                }}
              >
                <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
                <span
                  style={{
                    flex: 1,
                    borderBottom: '1px dotted #000',
                    marginLeft: mm(2),
                    height: 0,
                  }}
                />
              </div>
            )
          )}
          <div style={{ display: 'flex', gap: mm(4) }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'baseline',
                margin: 0,
              }}
            >
              <input type="checkbox" style={{ marginRight: mm(1) }} />
              <p
                style={{
                  alignItems: 'baseline',
                  fontFamily: 'sans-serif',
                  fontSize: '10pt',
                }}
              >
                อ้อ»ลูก
              </p>
            </label>
            <label style={{ display: 'flex', alignItems: 'baseline' }}>
              <input type="checkbox" style={{ marginRight: mm(1) }} />
              <p
                style={{
                  alignItems: 'baseline',
                  fontFamily: 'sans-serif',
                  fontSize: '10pt',
                }}
              >
                อ้อยตอ
              </p>
            </label>
          </div>
        </div>
        {/* ส่วนที่ 2 คือ QR Code */}
        <div
          style={{
            width: mm(25),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center', //flex start
            marginLeft: mm(2),
            marginBottom: 0,
          }}
        >
          <QRCodeCanvas value={qrValue} size={100} />
          <span
            style={{ marginTop: mm(1), textAlign: 'center', fontSize: '9pt' }}
          >
            {qrText}
          </span>
        </div>
      </div>
      {/* ส่วนที่ 3 คือข้อมูลเพิ่มเติม เขต โรงงาน อำเภอ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: mm(1),
          gap: mm(1.5),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: mm(0.5),
            gap: mm(1.5),
          }}
        >
          {/* Row 1: เขต (แคบ), โรงงาน, อำเภอ */}
          <div style={{ display: 'flex', gap: mm(4) }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
              <span>เขต</span>
              <span
                style={{
                  flex: 1,
                  borderBottom: '1px dotted #000',
                  marginLeft: mm(2),
                  height: 0,
                }}
              />
            </div>
            <div style={{ flex: 2, display: 'flex', alignItems: 'baseline' }}>
              <span>โรงงาน</span>
              <span
                style={{
                  flex: 1,
                  borderBottom: '1px dotted #000',
                  marginLeft: mm(2),
                  height: 0,
                }}
              />
            </div>
            <div style={{ flex: 2, display: 'flex', alignItems: 'baseline' }}>
              <span>อำเภอ</span>
              <span
                style={{
                  flex: 1,
                  borderBottom: '1px dotted #000',
                  marginLeft: mm(2),
                  height: 0,
                }}
              />
            </div>
          </div>

          {/* Row 2: วันที่เก็บ, ตำบล */}
          <div style={{ display: 'flex', gap: mm(4) }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'baseline' }}>
              <span>วันที่เก็บ</span>
              <span
                style={{
                  flex: 1,
                  borderBottom: '1px dotted #000',
                  marginLeft: mm(2),
                  height: 0,
                }}
              />
            </div>
            <div style={{ flex: 2, display: 'flex', alignItems: 'baseline' }}>
              <span>ตำบล</span>
              <span
                style={{
                  flex: 1,
                  borderBottom: '1px dotted #000',
                  marginLeft: mm(2),
                  height: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Label;
