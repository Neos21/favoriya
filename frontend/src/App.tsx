import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { theme } from './core/theme';
import { GlobalTimelinePage } from './pages/global-timeline/GlobalTimelinePage';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/login/LoginPage';
import { SignupPage } from './pages/signup/SignupPage';
import { AuthGuardRoute } from './shared/routes/AuthGuardRoute';
import { store } from './shared/stores/store';

export const App = () => (
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/signup" element={<SignupPage />}></Route>
          <Route path="/login"  element={<LoginPage  />}></Route>
          <Route path="/"       element={<HomePage   />}></Route>
          
          <Route element={<AuthGuardRoute />}>
            <Route path="/global-timeline" element={<GlobalTimelinePage />}></Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
);
