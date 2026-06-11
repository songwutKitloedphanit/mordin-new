import React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

const joinClassNames = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(' ');

export const PrivateCard = ({ className, children, ...props }: DivProps) => (
  <div className={joinClassNames('private-card', className)} {...props}>
    {children}
  </div>
);

export const PrivateCardHeader = ({
  className,
  children,
  ...props
}: DivProps) => (
  <div className={joinClassNames('private-card-header', className)} {...props}>
    {children}
  </div>
);

export const PrivateCardBody = ({
  className,
  children,
  ...props
}: DivProps) => (
  <div className={joinClassNames('private-card-body', className)} {...props}>
    {children}
  </div>
);

export const PrivateMetricCard = ({
  className,
  children,
  ...props
}: DivProps) => (
  <div className={joinClassNames('private-metric-card', className)} {...props}>
    {children}
  </div>
);

export default PrivateCard;
