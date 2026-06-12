import { formatElementTitle } from './executive-elements';

import EmptyState from '@/components/ui/EmptyState';

export interface SoilGradeElement {
  elementName: string;
  bars: { label: string; value: number; color: string }[];
}

// แผงผลวิเคราะห์ดิน: แสดง "ครบทุกธาตุ" พร้อมกันโดยไม่ต้องกดสลับ
// แต่ละธาตุเป็นบล็อกแถบแนวนอน เห็นชื่อระดับ จำนวน และ % ในบรรทัดเดียว — อ่านปราดเดียวรู้เรื่อง
const SoilGradePanel = ({ elements }: { elements: SoilGradeElement[] }) => {
  if (elements.length === 0) {
    return <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />;
  }

  return (
    <div className="exr-grid">
      {elements.map(element => {
        const total = element.bars.reduce((sum, bar) => sum + bar.value, 0);
        const top = element.bars.reduce((a, b) => (b.value > a.value ? b : a));
        const topPct = total > 0 ? (top.value / total) * 100 : 0;
        return (
          <div key={element.elementName}>
            <div className="exr-mini-label">
              {formatElementTitle(element.elementName)} ·{' '}
              {total.toLocaleString()} ตัวอย่าง
            </div>
            {element.bars.map(bar => {
              const pct = total > 0 ? (bar.value / total) * 100 : 0;
              return (
                <div className="exr-hbar-row" key={bar.label}>
                  <span className="exr-hbar-name">{bar.label}</span>
                  <div className="exr-hbar-track">
                    <div
                      className="exr-hbar-fill"
                      style={{ width: `${pct}%`, background: bar.color }}
                    ></div>
                  </div>
                  <span className="exr-hbar-val">
                    {bar.value.toLocaleString()}{' '}
                    <small>({pct.toFixed(0)}%)</small>
                  </span>
                </div>
              );
            })}
            <div className="exr-note mt-2 pt-2">
              ส่วนใหญ่ระดับ <b>{top.label}</b> ({topPct.toFixed(0)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SoilGradePanel;
