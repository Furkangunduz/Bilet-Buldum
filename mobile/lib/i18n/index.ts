import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import tr from './tr.json';

const resources = {
  en: {
    translation: en
  },
  tr: {
    translation: tr
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    lng: 'tr',
    defaultNS: 'translation',
    fallbackNS: 'translation',
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

const setupLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    if (savedLanguage && ['en', 'tr'].includes(savedLanguage)) {
      await i18n.changeLanguage(savedLanguage);
      return;
    }
    
    const languageToUse = 'tr';
    
    await AsyncStorage.setItem('user-language', languageToUse);
    await i18n.changeLanguage(languageToUse);
  } catch (error) {
    console.error('Error setting up language:', error);
    await i18n.changeLanguage('tr');
  }
};

setupLanguage();

export default i18n; 