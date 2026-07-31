import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  disabled = false,
  iconLeft,
  iconRight,
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#5F6F69]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {iconLeft && (
          <div className="absolute left-3 text-[#8B9893] pointer-events-none">
            {iconLeft}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          disabled={disabled}
          className={`
            w-full h-10 px-3 py-2 text-sm rounded-md border bg-white text-[#16231F]
            border-[#DFE7E3] placeholder-[#8B9893]
            focus:outline-none focus:ring-2 focus:ring-[#0D8F7A] focus:border-transparent
            disabled:bg-[#F8FAF9] disabled:text-[#8B9893] disabled:border-[#DFE7E3]
            ${iconLeft ? 'pl-10' : ''}
            ${iconRight ? 'pr-10' : ''}
            ${error ? 'border-[#D9534F] focus:ring-[#D9534F]' : ''}
          `}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 text-[#8B9893] pointer-events-none">
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-[#D9534F] mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
