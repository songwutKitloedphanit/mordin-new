import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  padded = true,
  className = '',
  children,
  ...rest
}) => {
  const base =
    'bg-white rounded-xl border border-mp-border shadow-sm transition';
  const padding = padded ? 'p-5' : '';
  return (
    <div className={`${base} ${padding} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

export default Card;
