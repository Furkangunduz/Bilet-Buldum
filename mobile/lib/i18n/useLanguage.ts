import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(async (language: 'tr' | 'en') => {
    try {
      await AsyncStorage.setItem('user-language', language);
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [i18n]);

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isEnglish: i18n.language === 'en',
    isTurkish: i18n.language === 'tr',
  };
};

export default useLanguage; 