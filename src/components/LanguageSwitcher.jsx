// This component provides buttons to change the application's language.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  // The i18n object is obtained from this hook to manage language changes.
  const { i18n } = useTranslation();
  // This function changes the language of the application and saves the selected language to local storage.
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <nav aria-label="Language selection">
      {/* The button's variant is dynamically set to 'secondary' for the currently active language, giving it a distinct visual style. */}
      <Button variant={i18n.language === 'fi' ? 'secondary' : 'ghost'} onClick={() => changeLanguage('fi')}>
        FI
        {i18n.language === 'fi' && <span className="sr-only">(current)</span>}
      </Button>
      <Button variant={i18n.language === 'sv' ? 'secondary' : 'ghost'} onClick={() => changeLanguage('sv')}>
        SV
        {i18n.language === 'sv' && <span className="sr-only">(current)</span>}
      </Button>
    </nav>
  );
};

export default LanguageSwitcher;
