import React, { useState } from 'react';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenFormText1 } from '../../../components/gui/GuiForm';

interface StandardBlankModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (name: string, repeatCount: number) => void;
}

const StandardBlankModal: React.FC<StandardBlankModalProps> = ({
  show,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [repeatCount, setRepeatCount] = useState(1);
  const [errors, setErrors] = useState<{ name?: string; repeatCount?: string }>(
    {}
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'กรุณาระบุชื่อ Blank';
    if (repeatCount < 1) errs.repeatCount = 'ต้องมีอย่างน้อย 1 รอบ';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(name.trim(), repeatCount);
    setName('');
    setRepeatCount(1);
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">เพิ่ม Blank Standard</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowConfirm(true)}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <GenFormText1
                id="blankName"
                name="blankName"
                label="ชื่อ Blank"
                placeholder="กรอกชื่อ Blank"
                value={name}
                onChange={e => setName(e.target.value)}
                errorMessage={errors.name}
                isRequired
              />
              <GenFormText1
                id="repeatCount"
                name="repeatCount"
                label="จำนวนรอบ (Repeat Count)"
                placeholder="เช่น 3"
                value={repeatCount}
                onChange={e => setRepeatCount(+e.target.value)}
                type="number"
                errorMessage={errors.repeatCount}
                isRequired
              />
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                บันทึก
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirm(true)}
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการปิดโดยไม่บันทึกหรือไม่?"
          action="cancel"
          onConfirm={() => {
            setShowConfirm(false);
            setName('');
            setRepeatCount(1);
            onClose();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default StandardBlankModal;
