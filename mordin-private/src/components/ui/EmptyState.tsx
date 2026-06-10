import React from 'react';

export interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center text-mp-textGray py-12 px-4 ${className}`.trim()}
    >
      {icon && <div className="mb-3 text-mp-textGray">{icon}</div>}
      <h3 className="text-base font-semibold text-mp-textDark">{title}</h3>
      {description && <p className="mt-1 text-sm max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
