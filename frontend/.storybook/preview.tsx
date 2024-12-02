import '../src/index.css'; // My Global CSS

import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { Preview, ReactRenderer } from '@storybook/react';

import { theme } from '../src/core/theme';
import { store } from '../src/shared/stores/store';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: (/(background|color)$/i),
        date: (/Date$/i)
      }
    }
  },
  decorators: [
    withThemeFromJSXProvider<ReactRenderer>({
      themes: {
        light: theme,
        dark: theme
      },
      defaultTheme: 'dark',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline
    }),
    // <Link to=""> を動くようにする・MemoryRouter でも問題なし
    (Story) => (
      <BrowserRouter>
        <Provider store={store}>
          <Story />
        </Provider>
      </BrowserRouter>
    )
  ]
};
export default preview;

