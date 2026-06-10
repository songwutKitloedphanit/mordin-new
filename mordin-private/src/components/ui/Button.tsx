import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-mp-dark text-white hover:bg-[#003a73] focus:ring-mp-light disabled:bg-slate-300',
  secondary:
    'bg-white text-mp-dark border border-mp-border hover:bg-slate-50 focus:ring-mp-light disabled:text-slate-400',
  ghost:
    'bg-transparent text-mp-dark hover:bg-slate-100 focus:ring-mp-light disabled:text-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 disabled:bg-red-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
};

export const Button = function Button({
  ref,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed';
  const width = fullWidth ? 'w-full' : '';
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${width} ${className}`.trim()}
      {...props}
    />
  );
};

export default Button;
