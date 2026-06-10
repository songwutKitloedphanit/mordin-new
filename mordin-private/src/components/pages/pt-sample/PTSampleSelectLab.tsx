import { JSX, useEffect, useState } from 'react';

import { GenButtonCircle } from '../../../components/gui/GuiButton';
import { getAllLaboratories } from '../../../services/api/laboratory/LaboratoryApi';
import { LaboratoryInfoInterface } from '../../../types/Laboratory';

export interface PTSampleSelectLabProps {
  onConfirm: (selectedLabs: LaboratoryInfoInterface[]) => void;
  onCancel?: () => void;
}

const PTSampleSelectLab = ({
  onConfirm,
  onCancel,
}: PTSampleSelectLabProps): JSX.Element => {
  const [labs, setLabs] = useState<LaboratoryInfoInterface[]>([]);
  const [selectedParams, setSelectedParams] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const labData = await getAllLaboratories();
        labData.sort(
          (a: LaboratoryInfoInterface, b: LaboratoryInfoInterface) =>
            a.laboratoryId - b.laboratoryId
        );
        setLabs(labData);

        const initParams: Record<string, boolean> = {};
        labData.forEach((lab: LaboratoryInfoInterface) => {
          initParams[lab.shortNameBefore] = lab.isMain;
        });
        setSelectedParams(initParams);
      } catch (error) {
        console.error('[SelectLab] Failed to load labs:', error);
      }
    };

    fetchLabs();
  }, []);

  const handleCheckboxChange = (key: string, disabled: boolean) => {
    if (!disabled) {
      setSelectedParams(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleNext = () => {
    const selected = labs.filter(l => selectedParams[l.shortNameBefore]);
    if (selected.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 parameter');
      return;
    }
    onConfirm(selected);
  };

  return (
    <div className="private-card">
      <div className="private-card-header d-flex justify-content-between align-items-center">
        <h4 className="private-card-title mb-0">แก้ไขค่า Standard</h4>
        <GenButtonCircle
          color="btn-primary"
          icon="fa fa-clipboard-list"
          link="/admin/standard"
        />
      </div>

      <div className="private-card-body">
        {labs.map((lab: LaboratoryInfoInterface) => {
          const isDisabled = lab.isMain;
          return (
            <div className="form-check" key={lab.laboratoryId}>
              <input
                className="form-check-input"
                type="checkbox"
                id={lab.shortNameBefore}
                checked={!!selectedParams[lab.shortNameBefore]}
                disabled={isDisabled}
                onChange={() =>
                  handleCheckboxChange(lab.shortNameBefore, isDisabled)
                }
              />
              <label
                className="form-check-label text-body"
                htmlFor={lab.shortNameBefore}
              >
                {lab.shortNameBefore} – {lab.name}
                {isDisabled && <span className="ms-2">(Main)</span>}
              </label>
            </div>
          );
        })}
      </div>

      <div className="private-card-footer d-flex">
        <button
          type="button"
          className="btn btn-success me-2"
          onClick={handleNext}
        >
          ต่อไป
        </button>
        <button
          type="button"
          className="btn btn-danger ms-auto"
          onClick={onCancel}
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};

export default PTSampleSelectLab;

