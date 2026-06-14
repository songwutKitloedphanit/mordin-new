import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface ConfirmAlertProps {
  title: string;
  text: string;
  action: 'delete' | 'cancel';
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmAlert: React.FC<ConfirmAlertProps> = ({
  title,
  text,
  action,
  onConfirm,
  onCancel,
}) => {
  const confirmButtonText = action === 'delete' ? 'ลบข้อมูล' : 'ยกเลิกเลย';

  const showAlert = () => {
    MySwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText,
      cancelButtonText: 'ไม่, กลับไป',
    }).then(result => {
      if (result.isConfirmed) {
        onConfirm();
      } else if (result.dismiss === Swal.DismissReason.cancel && onCancel) {
        onCancel();
      }
    });
  };

  // Trigger the alert when component is mounted
  showAlert();

  return null; // Component doesn't render anything, just triggers the alert
};

export default ConfirmAlert;
