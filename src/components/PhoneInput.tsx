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
      <label className="block text-sm font-semibold text-gray-300">
        {t('phone_number')} <span className="text-red-400 ml-1">*</span>
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
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
      
      <style jsx global>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: stretch;
          border: 1px solid #4b5563;
          border-radius: 8px;
          background: #374151;
          transition: all 0.2s;
          height: 48px;
        }
        
        .phone-input-wrapper .PhoneInput:hover {
          border-color: #6b7280;
        }
        
        .phone-input-wrapper .PhoneInput:focus-within {
          outline: none;
          box-shadow: 0 0 0 2px #60a5fa40;
          border-color: #60a5fa;
        }
        
        .phone-input-wrapper .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 0 12px;
          border: none;
          background: transparent;
          border-right: 1px solid #6b7280;
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
          background: #374151;
          border: none;
          outline: none;
          font-size: 14px;
          color: #e5e7eb;
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
          color: #e5e7eb;
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