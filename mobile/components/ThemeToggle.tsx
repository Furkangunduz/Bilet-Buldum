import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { useTheme } from '~/lib/theme-provider';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';

export function ThemeToggle() {
  const { isDarkColorScheme } = useColorScheme();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(theme === 'system' 
      ? (isDarkColorScheme ? 'light' : 'dark')
      : theme === 'dark' ? 'light' : 'dark'
    );
  };

  return (
    <Pressable
      onPress={handleThemeChange}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'flex-1 aspect-square pt-0.5 justify-center items-start web:px-5',
            pressed && 'opacity-70'
          )}
        >
          {isDarkColorScheme ? (
            <MoonStar className='text-foreground' size={23} strokeWidth={1.25} />
          ) : (
            <Sun className='text-foreground' size={24} strokeWidth={1.25} />
          )}
        </View>
      )}
    </Pressable>
  );
}
