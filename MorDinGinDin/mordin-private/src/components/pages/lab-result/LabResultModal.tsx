interface ModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  title?: string;
  children?: React.ReactNode;
}

const LabResultModal: React.FC<ModalProps> = ({
  show,
  onClose,
  onSave,
  title = 'Modal title',
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
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {children ?? <p>Modal body text goes here.</p>}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabResultModal;
