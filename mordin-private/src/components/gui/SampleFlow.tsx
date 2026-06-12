import React from 'react';

import { SampleStatusEnum } from '@/types/qr-code/QrCode';

// 4 ขั้นของวงจรตัวอย่างดิน — ใช้ class `.flow-*` ชุดเดียวกับ timeline
// ในหน้า SampleReceivingInfo เพื่อให้หน้าตาเหมือนกันทั้งระบบ
const FLOW_STEPS: {
  label: string;
  statuses: SampleStatusEnum[];
  icon: string;
}[] = [
  {
    label: 'เก็บตัวอย่าง',
    statuses: [
      SampleStatusEnum.COLLECTED,
      SampleStatusEnum.RECEIVED,
      SampleStatusEnum.ANALYZING,
      SampleStatusEnum.ANALYZED,
      SampleStatusEnum.APPROVED,
    ],
    icon: 'fas fa-map-marker-alt',
  },
  {
    label: 'รับเข้าระบบ',
    statuses: [
      SampleStatusEnum.RECEIVED,
      SampleStatusEnum.ANALYZING,
      SampleStatusEnum.ANALYZED,
      SampleStatusEnum.APPROVED,
    ],
    icon: 'fas fa-check-circle',
  },
  {
    label: 'วิเคราะห์แล็บ',
    statuses: [
      SampleStatusEnum.ANALYZING,
      SampleStatusEnum.ANALYZED,
      SampleStatusEnum.APPROVED,
    ],
    icon: 'fas fa-vial',
  },
  {
    label: 'ออกรายงาน',
    statuses: [SampleStatusEnum.ANALYZED, SampleStatusEnum.APPROVED],
    icon: 'fas fa-file-invoice',
  },
];

interface SampleFlowProps {
  status: SampleStatusEnum | undefined;
  title?: string;
}

/**
 * Timeline สถานะตัวอย่างดิน (reusable) — ตรรกะ/ดีไซน์เดียวกับ
 * renderTimeline ใน SampleReceivingInfo (mockup .flow)
 */
const SampleFlow: React.FC<SampleFlowProps> = ({
  status,
  title = 'สถานะขั้นตอนของตัวอย่างดิน',
}) => (
  <div className="private-card mb-4">
    <div className="private-card-body py-4">
      <h5 className="fw-bold text-dark mb-4 text-center">
        <i className="fas fa-route me-2 text-primary" />
        {title}
      </h5>
      <div className="flow">
        {FLOW_STEPS.map((step, idx) => {
          const isDone =
            status != null &&
            step.statuses.includes(status) &&
            status !== step.statuses[0];
          const isNow = status === step.statuses[0] || (idx === 0 && !status);
          const stepClass = isDone
            ? 'flow-step done'
            : isNow
              ? 'flow-step now'
              : 'flow-step';
          return (
            <div key={step.label} className={stepClass}>
              <div className="flow-dot">
                {isDone ? (
                  <i className="fas fa-check" />
                ) : (
                  <i className={step.icon} style={{ fontSize: '10px' }} />
                )}
              </div>
              <span className="flow-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default SampleFlow;
