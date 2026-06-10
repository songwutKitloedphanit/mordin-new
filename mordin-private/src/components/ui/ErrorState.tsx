import React from 'react';

import Button from './Button';

export interface ErrorStateProps {
  title?: React.ReactNode;
  message?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'เกิดข้อผิดพลาด',
  message = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง',
  onRetry,
  retryLabel = 'ลองอีกครั้ง',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`.trim()}
    >
      <h3 className="text-base font-semibold text-red-600">{title}</h3>
      {message && (
        <p className="mt-1 text-sm text-mp-textGray max-w-md">{message}</p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
