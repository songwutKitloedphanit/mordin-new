import React from 'react';

interface SelectStandardModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  description?: string;
  children?: React.ReactNode;
}

const SelectStandardModal: React.FC<SelectStandardModalProps> = ({
  show,
  onClose,
  onSave,
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
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
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
            <button type="button" className="btn btn-primary" onClick={onSave}>
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectStandardModal;
