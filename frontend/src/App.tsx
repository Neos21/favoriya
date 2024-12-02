import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { theme } from './core/theme';
import { HomePage } from './pages/home/Home';
import { LoginPage } from './pages/login/Login';
import { store } from './shared/stores/store';

export const App = () => (
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/"      element={<HomePage  />}></Route>
        </Routes>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
);
