import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'ru', name: 'Русский', flag: 'RU' },
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'ar', name: 'العربية', flag: 'AR' },
  ];

  return (
    <div className="relative group z-50">
      <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-500">
        <Languages className="w-4 h-4 text-gray-300" />
        <span className="text-sm font-medium text-gray-200">
          <span className="inline-flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
              {languages.find(lang => lang.code === language)?.flag}
            </span>
            {languages.find(lang => lang.code === language)?.name}
          </span>
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 min-w-[140px] group-hover:delay-100">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              language === lang.code ? 'bg-blue-900/30 text-blue-300' : 'text-gray-200'
            }`}
          >
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded min-w-[28px] text-center">
              {lang.flag}
            </span>
            <span className="text-sm font-medium">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;