import { useContext } from 'react';

import { ThemeModeContext } from '../../core/themes/ThemeModeContext';

/** Use Theme Mode Hook */
export const useThemeMode = () => useContext(ThemeModeContext);
