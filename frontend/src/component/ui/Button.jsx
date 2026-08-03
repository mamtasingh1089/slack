import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D8F7A] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-[#0D8F7A] text-white hover:bg-[#087765] active:bg-[#065e50]',
    secondary: 'bg-[#E5F5F1] text-[#0D8F7A] hover:bg-[#d0ece4] active:bg-[#badfd5]',
    ghost: 'bg-transparent text-[#5F6F69] hover:bg-[#F3F7F5] hover:text-[#16231F]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
