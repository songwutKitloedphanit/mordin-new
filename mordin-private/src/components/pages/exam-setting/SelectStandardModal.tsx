import React from 'react';

interface SelectStandardModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
  description?: string;
  children?: React.ReactNode;
}

const SelectStandardModal: React.FC<SelectStandardModalProps> = ({
  show,
  onClose,
  onSave,
  isSaving = false,
  description,
  children,
}) => {
  return (
    <div
      className={`modal ${show ? 'd-block show' : 'd-none'}`}
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title">เลือกมาตรฐาน (Select Standard)</h5>
              {description && (
                <small className="text-muted d-block mt-1">{description}</small>
              )}
            </div>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ปิด
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectStandardModal;
