import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { LayoutComponent } from './core/components/LayoutComponent/LayoutComponent';
import { theme } from './core/theme';
import { GlobalTimelinePage } from './pages/global-timeline/GlobalTimelinePage';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/login/LoginPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SignupPage } from './pages/signup/SignupPage';
import { AuthGuardRoute } from './shared/routes/AuthGuardRoute';
import { store } from './shared/stores/store';

/** App */
export const App = () => (
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<LayoutComponent />}>
            
            <Route index          element={<HomePage   />}></Route>
            <Route path="/signup" element={<SignupPage />}></Route>
            <Route path="/login"  element={<LoginPage  />}></Route>
            
            <Route element={<AuthGuardRoute />}>
              <Route path="/global-timeline" element={<GlobalTimelinePage />}></Route>
              <Route path="/settings"        element={<SettingsPage       />}></Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
);
