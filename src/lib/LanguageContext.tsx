'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from 'react';
import { Padauk } from 'next/font/google';
import { translations, Lang } from '@/lib/translations';

/** Myanmar UI readability — clinic-drtunmyatwin-com-website-design */
const padauk = Padauk({
  weight: ['400', '700'],
  subsets: ['myanmar'],
  display: 'swap',
});

const STORAGE_KEY = 'language';
const LANG_CHANGE_EVENT = 'clinic-language-change';

function getClientLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' || saved === 'my' ? saved : 'my';
}

function subscribeLang(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener('storage', onStorage);
  window.addEventListener(LANG_CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(LANG_CHANGE_EVENT, onCustom);
  };
}

function getServerLang(): Lang {
  return 'my';
}

interface LanguageContextType {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: typeof translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLang,
    getClientLang,
    getServerLang
  );

  const handleSetLanguage = useCallback((lang: Lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      <div
        lang={language}
        className={`min-h-screen ${language === 'my' ? `myanmar-site-typography ${padauk.className}` : ''}`}
      >
        {children}
      </div>
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
