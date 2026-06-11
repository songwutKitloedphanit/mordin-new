import React, { useEffect } from 'react';

import { swalConfirm, swalConfirmDelete } from '@/utils/swal';

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
  useEffect(() => {
    const fire =
      action === 'delete'
        ? swalConfirmDelete(title, text)
        : swalConfirm(title, text);

    fire.then(result => {
      if (result.isConfirmed) {
        onConfirm();
      } else if (onCancel) {
        onCancel();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default ConfirmAlert;
