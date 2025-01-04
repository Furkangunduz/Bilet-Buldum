import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { setAndroidNavigationBar } from './android-navigation-bar';
import { useColorScheme } from './useColorScheme';

type Theme = 'dark' | 'light' | 'system';
type ColorScheme = 'dark' | 'light';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>('system');
  const { setColorScheme } = useColorScheme();
  const deviceColorScheme = useDeviceColorScheme();

  useEffect(() => {
    // Load saved theme
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system')) {
        setTheme(savedTheme as Theme);
      }
    });
  }, []);

  useEffect(() => {
    // Save theme changes
    AsyncStorage.setItem('theme', theme);

    // Apply theme
    const effectiveTheme: ColorScheme = theme === 'system' 
      ? (deviceColorScheme ?? 'light') 
      : theme as ColorScheme;
      
    setColorScheme(effectiveTheme);
    setAndroidNavigationBar(effectiveTheme);
  }, [theme, deviceColorScheme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 