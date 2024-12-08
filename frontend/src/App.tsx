import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { LayoutComponent } from './core/components/LayoutComponent/LayoutComponent';
import { AuthGuardRoute } from './core/routes/AuthGuardRoute';
import { theme } from './core/theme';
import { GlobalTimelinePage } from './pages/global-timeline/GlobalTimelinePage';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/login/LoginPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SignupPage } from './pages/signup/SignupPage';
import { PostPage } from './pages/users/posts/PostPage';
import { UserPage } from './pages/users/UserPage';
import { store } from './shared/stores/store';

/** App */
export const App = () => (
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route element={<LayoutComponent />}>
            <Route element={<AuthGuardRoute />}>
              <Route path="/global-timeline" element={<GlobalTimelinePage />}></Route>
              <Route path="/settings"        element={<SettingsPage       />}></Route>
              
              <Route path="/:userId/posts/:postId" element={<PostPage />} />
              <Route path="/:userId/posts"         element={<UserPage />} />
              <Route path="/:userId"               element={<UserPage />} />
            </Route>
            
            <Route path="/signup" element={<SignupPage      />}></Route>
            <Route path="/login"  element={<LoginPage       />}></Route>
            <Route path="/"       element={<HomePage        />}></Route>
            <Route path="*"       element={<Navigate to="/" />}></Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
);
