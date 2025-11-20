'use client';

import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  placeholder,
  required = false,
  value,
  onChange,
  error,
  autoComplete
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 bg-gray-850 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-700 focus:border-accent/50'}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;