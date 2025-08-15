import React, { createContext, useContext, useState, ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import ruTranslations from '../locales/ru.json';
import frTranslations from '../locales/fr.json';
import arTranslations from '../locales/ar.json';
import uiTranslations from '../locales/ui.json';

export type Language = 'en' | 'ru' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  ui: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: enTranslations,
  ru: ruTranslations,
  fr: frTranslations,
  ar: arTranslations
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  };

  const ui = (key: string): string => {
    const uiText = uiTranslations[language]?.[key];
    if (!uiText) {
      console.warn(`UI translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    return uiText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, ui }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};