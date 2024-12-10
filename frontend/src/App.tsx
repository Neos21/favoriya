import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { LayoutComponent } from './core/components/LayoutComponent/LayoutComponent';
import { AuthGuardRoute } from './core/routes/AuthGuardRoute';
import { theme } from './core/theme';
import { GlobalTimelinePage } from './pages/global-timeline/GlobalTimelinePage';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/login/LoginPage';
import { ChangeAvatarPage } from './pages/settings/change-avatar/ChangeAvatarPage';
import { DeleteAccountPage } from './pages/settings/delete-account/DeleteAccountPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SignupPage } from './pages/signup/SignupPage';
import { PostPage } from './pages/users/posts/PostPage';
import { UserPage } from './pages/users/UserPage';
import { UsersPage } from './pages/users/UsersPage';
import { LoadingSpinnerComponent } from './shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { store } from './shared/stores/store';

// Lazy Loading
const AdminGuardRoute = lazy(async () => ({ default: (await import('./core/routes/AdminGuardRoute')).AdminGuardRoute }));

/** App */
export const App = () => (
  <Suspense fallback={<LoadingSpinnerComponent />}>
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<LayoutComponent />}>
              <Route element={<AuthGuardRoute />}>
                <Route path="/global-timeline" element={<GlobalTimelinePage />} />
                
                <Route path="/settings/delete-account" element={<DeleteAccountPage />} />
                <Route path="/settings/change-avatar"  element={<ChangeAvatarPage  />} />
                <Route path="/settings"                element={<SettingsPage      />} />
                
                <Route path="/users"                 element={<UsersPage />} />
                
                <Route path="/:userId/posts/:postId" element={<PostPage  />} />
                <Route path="/:userId/posts"         element={<UserPage  />} />
                <Route path="/:userId"               element={<UserPage  />} />
                
                <Route path="/admin/*" element={<AdminGuardRoute />} />
              </Route>
              
              <Route path="/signup" element={<SignupPage      />} />
              <Route path="/login"  element={<LoginPage       />} />
              <Route path="/"       element={<HomePage        />} />
              <Route path="*"       element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  </Suspense>
);
