import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { theme } from './core/theme';
import { HomePage } from './pages/home/Home';
import { LoginPage } from './pages/login/Login';

export const App = () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/"      element={<HomePage  />}></Route>
      </Routes>
    </ThemeProvider>
  </BrowserRouter>
);
