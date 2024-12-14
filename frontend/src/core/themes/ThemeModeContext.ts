import { createContext } from 'react';

/** Theme Mode Context */
export const ThemeModeContext = createContext({
  toggleTheme: () => {},
  mode: (() => localStorage.getItem('theme'))()
});
