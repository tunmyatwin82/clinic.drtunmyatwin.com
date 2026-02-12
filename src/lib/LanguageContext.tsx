'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Lang } from '@/lib/translations';

interface LanguageContextType {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: typeof translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Lang>('my');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Lang;
    if (saved && (saved === 'en' || saved === 'my')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
