import React, { useState, useEffect } from 'react';

import { GenButtonCircle } from '@/components/gui/GuiButton';
import { StandardInfo } from '@/types/standard-sample/Standard';

interface StandardTableInfoProps {
  selectedStandards: StandardInfo[];
  onRemove: (standardId: number) => void;
  onRepeatChange?: (standardId: number, repeatCount: number) => void;
}

const StandardTableInfo: React.FC<StandardTableInfoProps> = ({
  selectedStandards,
  onRemove,
  onRepeatChange,
}) => {
  const [repeatCounts, setRepeatCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const initialCounts: Record<number, number> = {};

    selectedStandards?.forEach(s => {
      if (s && typeof s.standardId === 'number') {
        initialCounts[s.standardId] = repeatCounts[s.standardId] ?? 1;
      }
    });

    setRepeatCounts(initialCounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStandards]);

  const updateRepeat = (standardId: number, value: number) => {
    const newValue = Math.max(1, value);
    setRepeatCounts(prev => ({
      ...prev,
      [standardId]: newValue,
    }));
    onRepeatChange?.(standardId, newValue);
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="card-title">รายการมาตรฐานที่เลือก</h5>
      </div>
      <div className="card-body">
        {selectedStandards.length === 0 ? (
          <p className="text-muted">ยังไม่ได้เลือกมาตรฐาน</p>
        ) : (
          <ul className="list-group">
            {selectedStandards
              .filter(
                (s): s is StandardInfo =>
                  s != null &&
                  typeof s.standardId === 'number' &&
                  s.type === 'crm'
              ) // แสดงเฉพาะ type CRM
              .map(standard => (
                <li
                  key={standard.standardId}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{standard.standardName}</strong>
                      </div>
                      <div className="d-flex align-items-center">
                        <small className="ms-2 text-muted">
                          จำนวน repeat &nbsp;
                        </small>
                        <GenButtonCircle
                          color="btn-outline-secondary btn-sm"
                          icon="fa fa-minus"
                          onClick={() =>
                            updateRepeat(
                              standard.standardId,
                              repeatCounts[standard.standardId] - 1
                            )
                          }
                        />
                        <span className="mx-2">
                          {repeatCounts[standard.standardId] ?? 1}
                        </span>
                        <GenButtonCircle
                          color="btn-outline-secondary btn-sm"
                          icon="fa fa-plus"
                          onClick={() =>
                            updateRepeat(
                              standard.standardId,
                              repeatCounts[standard.standardId] + 1
                            )
                          }
                        />
                        <small className="ms-2 text-muted">ครั้ง</small>
                        <GenButtonCircle
                          color="btn-danger btn-sm ms-3"
                          icon="fa fa-trash"
                          onClick={() => onRemove(standard.standardId)}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StandardTableInfo;
