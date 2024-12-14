import { ReactNode, useEffect, useState } from 'react';

import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { themeConstants } from '../../shared/constants/theme-constants';
import { ThemeModeContext } from './ThemeModeContext';
import { darkTheme, lightTheme } from './themes';

/** Theme Mode Provider */
export const ThemeModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // useThemeMode Hook 用
  const [mode, setMode] = useState<'dark' | 'light'>((() => localStorage.getItem(themeConstants.localStorageKey))() as 'dark' | 'light');
  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };
  
  // 初回読み込み時 : index.html にて LocalStorage に格納してから読み込んでいる
  useEffect(() => {
    setMode(localStorage.getItem(themeConstants.localStorageKey) as 'dark' | 'light');
  }, []);
  
  // システムテーマの変更時 index.html で設定される LocalStorage の値を利用して setMode() 切替だけ行う
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  useEffect(() => {
    setMode(localStorage.getItem(themeConstants.localStorageKey) as 'dark' | 'light');
  }, [prefersDarkMode]);
  
  return (
    <ThemeModeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme} noSsr disableTransitionOnChange>
        <CssBaseline />
          {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
