'use client';

import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  className = '',
  icon
}) => {
  const baseClasses = "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none";
  
  const variantClasses = {
    primary: "bg-accent hover:bg-accent-light text-white shadow-neon",
    secondary: "btn-gradient text-white border border-accent/20 shadow-neon",
    outline: "bg-transparent border border-accent hover:border-accent-light text-accent hover:text-accent-light",
    ghost: "bg-transparent hover:bg-accent/10 text-gray-300 hover:text-white"
  };
  
  const sizeClasses = {
    sm: "text-xs py-2 px-3",
    md: "text-sm py-3 px-4",
    lg: "text-base py-3 sm:py-4 px-4 sm:px-6"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]";
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {variant === 'primary' && (
        <span className="absolute inset-0 rounded-md bg-gradient-to-r from-accent-light/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></span>
      )}
    </button>
  );
};

export default Button;