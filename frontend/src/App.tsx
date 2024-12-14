import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LayoutComponent } from './core/components/LayoutComponent/LayoutComponent';
import { AuthGuardRoute } from './core/routes/AuthGuardRoute';
import { ThemeModeProvider } from './core/themes/ThemeModeContextProvider';
import { GlobalTimelinePage } from './pages/global-timeline/GlobalTimelinePage';
import { HomeTimelinePage } from './pages/home-timeline/HomeTimelinePage';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/login/LoginPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ChangeAvatarPage } from './pages/settings/change-avatar/ChangeAvatarPage';
import { DeleteAccountPage } from './pages/settings/delete-account/DeleteAccountPage';
import { LoginHistoriesPage } from './pages/settings/login-histories/LoginHistoriesPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SignupPage } from './pages/signup/SignupPage';
import { FollowersPage } from './pages/users/followers/FollowersPage';
import { FollowingsPage } from './pages/users/followings/FollowingsPage';
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
        <ThemeModeProvider>
          <Routes>
            <Route element={<LayoutComponent />}>
              <Route element={<AuthGuardRoute />}>
                <Route path="/home-timeline"   element={<HomeTimelinePage   />} />
                <Route path="/global-timeline" element={<GlobalTimelinePage />} />
                
                <Route path="/settings/login-histories" element={<LoginHistoriesPage />} />
                <Route path="/settings/delete-account"  element={<DeleteAccountPage  />} />
                <Route path="/settings/change-avatar"   element={<ChangeAvatarPage   />} />
                <Route path="/settings"                 element={<SettingsPage       />} />
                
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/users"         element={<UsersPage         />} />
                
                <Route path="/:userId/followers"     element={<FollowersPage  />} />
                <Route path="/:userId/followings"    element={<FollowingsPage />} />
                <Route path="/:userId/posts/:postId" element={<PostPage       />} />
                <Route path="/:userId/posts"         element={<UserPage       />} />
                <Route path="/:userId"               element={<UserPage       />} />
                
                <Route path="/admin/*" element={<AdminGuardRoute />} />
                
              </Route>
            </Route>
            
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login"  element={<LoginPage  />} />
            <Route path="*"       element={<Navigate to="/" />} />
          </Routes>
        </ThemeModeProvider>
      </Provider>
    </BrowserRouter>
  </Suspense>
);
