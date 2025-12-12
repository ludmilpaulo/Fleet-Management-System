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
      
      // Check for saved language preference
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const supportedLngs = i18n.options.supportedLngs || ['en', 'pt', 'es'];
      
      if (savedLang && supportedLngs.includes(savedLang)) {
        // Use saved preference
        i18n.changeLanguage(savedLang).catch(() => {});
      } else {
        // Detect browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && supportedLngs.includes(browserLang)) {
          i18n.changeLanguage(browserLang).catch(() => {});
          localStorage.setItem(LANGUAGE_STORAGE_KEY, browserLang);
        }
      }

      // Listen for language changes and persist them
      i18n.on('languageChanged', (lng) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      });
    };

    initializeLanguage();
    setReady(true);
  }, []);

  if (!ready) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

