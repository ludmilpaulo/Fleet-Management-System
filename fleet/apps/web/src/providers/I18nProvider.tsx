'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

type Props = {
  children: ReactNode;
};

const LANGUAGE_STORAGE_KEY = 'fleetia-language';

export function I18nProvider({ children }: Props) {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      setReady(false);
    }

    const initializeLanguage = () => {
      if (typeof window === 'undefined') return;
      
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const supportedLngs = ['en', 'pt', 'es', 'fr'];
      
      if (savedLang && supportedLngs.includes(savedLang)) {
        i18n.changeLanguage(savedLang).catch(() => {});
      } else {
        // Use system/browser language: Portuguese → pt, English → en, Spanish → es, French → fr
        const browserLang = navigator.language?.split('-')[0];
        const lang = supportedLngs.includes(browserLang) ? browserLang : 'en';
        i18n.changeLanguage(lang).catch(() => {});
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }

      // Listen for language changes: persist and update html lang for accessibility
      i18n.on('languageChanged', (lng) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lng.split('-')[0];
        }
      });
      // Set initial html lang
      if (typeof document !== 'undefined') {
        document.documentElement.lang = i18n.language?.split('-')[0] || 'en';
      }
    };

    initializeLanguage();
    setReady(true);
  }, []);

  if (!ready) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

