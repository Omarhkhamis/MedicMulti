import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  className?: string;
  onBlur?: () => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  options,
  className = '',
  onBlur
}) => {
  const { t } = useLanguage();

  const baseInputClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    error
      ? 'border-red-300 bg-red-50 focus:ring-red-500'
      : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
  }`;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'select' && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={baseInputClasses}
        >
          <option value="">{t('select')} {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={4}
          className={baseInputClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={baseInputClasses}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default FormInput;