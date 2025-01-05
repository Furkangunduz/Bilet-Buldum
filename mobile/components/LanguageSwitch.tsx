import { Languages } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleLanguage = () => {
    const nextLanguage = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      className="p-2 rounded-full bg-muted/10 active:bg-muted/20"
    >
      <Languages size={20} color={isDark ? '#A1A1AA' : '#71717A'} />
    </TouchableOpacity>
  );
} 