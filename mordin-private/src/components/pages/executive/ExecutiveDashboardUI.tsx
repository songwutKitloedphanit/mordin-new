// คอมโพเนนต์ presentational ที่ใช้ร่วมกันระหว่างหน้า Executive Dashboard ทั้งสองหน้า
// (เดิม copy-paste ซ้ำใน Dashboard.tsx และ Dashboard2.tsx)

export const SectionCard = ({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}) => (
  <div className="private-card mb-0">
    <div className="private-card-header">
      <h4 className="private-card-title mb-0 d-flex align-items-center">
        {icon && <i className={`${icon} me-2 text-primary`}></i>}
        {title}
      </h4>
      {subtitle && (
        <p
          className="text-body-secondary mb-0 mt-1"
          style={{ fontSize: '1.1rem' }}
        >
          {subtitle}
        </p>
      )}
    </div>
    <div className="private-card-body">{children}</div>
  </div>
);

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
export const BriefTile = ({
  icon,
  accent,
  label,
  value,
  sub,
  empty,
}: {
  icon: string;
  accent: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  empty?: boolean;
}) => (
  <div className="col-lg-4 col-md-6">
    <div className="exec-brief-tile" style={{ borderInlineStartColor: accent }}>
      <span
        className="exec-brief-tile-icon"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <i className={icon}></i>
      </span>
      <div className="exec-brief-tile-body">
        <div className="exec-brief-tile-label">{label}</div>
        {empty ? (
          <div className="exec-brief-tile-empty">— ไม่มีข้อมูล —</div>
        ) : (
          <>
            <div className="exec-brief-tile-value">{value}</div>
            {sub && <div className="exec-brief-tile-sub">{sub}</div>}
          </>
        )}
      </div>
    </div>
  </div>
);
