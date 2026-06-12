// คอมโพเนนต์ presentational ที่ใช้ร่วมกันระหว่างหน้า Executive Dashboard ทั้งสองหน้า
// (เดิม copy-paste ซ้ำใน Dashboard.tsx และ Dashboard2.tsx)

export const StatusNotice = ({
  message,
  type = 'info',
}: {
  message: string;
  type?: 'info' | 'error';
}) => (
  <div
    className={`alert ${type === 'error' ? 'alert-danger' : 'alert-info'} py-2`}
    role="status"
  >
    {message}
  </div>
);

// ไทล์ข้อสรุปเด่นใน Executive Brief — ดึง "หนึ่งใจความ" ของแต่ละด้านมาวางให้เห็นทันที
// ดีไซน์ใหม่: การ์ดไล่สีอ่อนตามโทน (น้ำเงิน/เขียว/เหลือง) ป้ายกำกับตัวพิมพ์เล็กด้านบน
export type BriefTone = 'blue' | 'green' | 'amber';

export const BriefTile = ({
  icon,
  tone,
  label,
  value,
  sub,
  empty,
}: {
  icon: string;
  tone: BriefTone;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  empty?: boolean;
}) => (
  <div className={`exr-insight i-${tone}`}>
    <div className="exr-insight-ic">
      <i className={icon}></i>
    </div>
    <div className="min-w-0">
      <div className="exr-insight-l">{label}</div>
      {empty ? (
        <div className="exr-insight-empty">— ไม่มีข้อมูล —</div>
      ) : (
        <>
          <div className="exr-insight-v">{value}</div>
          {sub && <div className="exr-insight-s">{sub}</div>}
        </>
      )}
    </div>
  </div>
);
