import React from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = function Select({
  ref,
  label,
  error,
  hint,
  className = '',
  id,
  children,
  ...rest
}: SelectProps & { ref?: React.RefObject<HTMLSelectElement | null> }) {
  const fieldId = id ?? rest.name;
  const base =
    'w-full rounded-md border pl-3 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2';
  const state = error
    ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
    : 'border-slate-300 focus:ring-mp-light focus:border-mp-dark';
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-mp-textDark mb-1"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        className={`${base} ${state} ${className}`.trim()}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-mp-textGray">{hint}</p>
      ) : null}
    </div>
  );
};

export default Select;
