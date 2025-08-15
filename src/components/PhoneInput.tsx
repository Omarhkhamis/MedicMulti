import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import PhoneInputWithCountrySelect from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  onBlur?: () => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  onBlur
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {t('phone_number')} <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="phone-input-wrapper">
        <PhoneInputWithCountrySelect
          international
          countryCallingCodeEditable={false}
          value={value}
          onChange={(phone) => onChange(phone || '')}
          onBlur={onBlur}
          placeholder={t('phone_number')}
          className={`phone-input ${error ? 'phone-input-error' : ''}`}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      
      <style jsx global>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: stretch;
          border: 1px solid ${error ? '#fca5a5' : '#d1d5db'};
          border-radius: 8px;
          background: ${error ? '#fef2f2' : 'white'};
          transition: all 0.2s;
          height: 48px;
        }
        
        .phone-input-wrapper .PhoneInput:hover {
          border-color: ${error ? '#fca5a5' : '#9ca3af'};
        }
        
        .phone-input-wrapper .PhoneInput:focus-within {
          outline: none;
          box-shadow: 0 0 0 2px ${error ? '#ef4444' : '#3b82f6'}40;
          border-color: ${error ? '#ef4444' : '#3b82f6'};
        }
        
        .phone-input-wrapper .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 0 12px;
          border: none;
          background: transparent;
          border-right: 1px solid #e5e7eb;
          border-radius: 0;
          min-width: 80px;
        }
        
        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 20px;
          height: 15px;
          margin-right: 6px;
          flex-shrink: 0;
        }
        
        .phone-input-wrapper .PhoneInputCountrySelect {
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }
        
        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 16px;
          font-size: 16px;
          background: transparent;
          color: #374151;
          border-radius: 0;
          height: 100%;
        }
        
        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default PhoneInput;