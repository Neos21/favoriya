import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ContrastIcon from '@mui/icons-material/Contrast';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import SettingsIcon from '@mui/icons-material/Settings';
import { Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

import { themeConstants } from '../../../shared/constants/theme-constants';
import { userConstants } from '../../../shared/constants/user-constants';
import { useThemeMode } from '../../../shared/hooks/use-theme-mode';
import { initialUserState, setUser } from '../../../shared/stores/user-slice';

import type { RootState } from '../../../shared/stores/store';

type Props = {
  onClickItem: () => void;
};

/** Menu Component */
export const MenuComponent: FC<Props> = ({ onClickItem }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userState = useSelector((state: RootState) => state.user);
  const { toggleTheme, mode } = useThemeMode();
  
  /** On Click */
  const onLogout = () => {
    onClickItem();
    dispatch(setUser(Object.assign({}, initialUserState)));
    localStorage.removeItem(userConstants.localStorageKey);
    navigate('/login');
  };
  
  /** カラーテーマ切替 */
  const onToggleTheme = () => {
    const currentMode = mode;
    toggleTheme();
    document.documentElement.classList.add              (currentMode === 'light' ? 'dark'  : 'light');
    document.documentElement.classList.remove           (currentMode === 'light' ? 'light' : 'dark' );
    localStorage.setItem(themeConstants.localStorageKey, currentMode === 'light' ? 'dark'  : 'light');
  };
  
  return <List className="menu-component-list">
    <ListItem disablePadding>
      <ListItemButton component={Link} to="/home-timeline" onClick={onClickItem} selected={location.pathname === '/home-timeline'}>
        <ListItemIcon><HomeIcon /></ListItemIcon>
        <ListItemText primary="ホーム" />
      </ListItemButton>
    </ListItem>
    
    <ListItem disablePadding>
      <ListItemButton component={Link} to="/global-timeline" onClick={onClickItem} selected={location.pathname === '/global-timeline'}>
        <ListItemIcon><PublicIcon /></ListItemIcon>
        <ListItemText primary="グローバル" />
      </ListItemButton>
    </ListItem>
    
    <ListItem disablePadding>
      <ListItemButton component={Link} to="/notifications" onClick={onClickItem} selected={location.pathname === '/notifications'}>
        <ListItemIcon><NotificationsIcon /></ListItemIcon>
        <ListItemText primary="通知" />
      </ListItemButton>
    </ListItem>
    
    <ListItem disablePadding>
      <ListItemButton component={Link} to={`/@${userState.id}`} onClick={onClickItem} selected={location.pathname === `/@${userState.id}`}>
        <ListItemIcon><AccountCircleIcon /></ListItemIcon>
        <ListItemText primary="プロフィール" />
      </ListItemButton>
    </ListItem>
    
    <ListItem disablePadding>
      <ListItemButton component={Link} to="/settings" onClick={onClickItem} selected={location.pathname.startsWith('/settings')}>
        <ListItemIcon><SettingsIcon /></ListItemIcon>
        <ListItemText primary="設定" />
      </ListItemButton>
    </ListItem>
    
    <ListItem disablePadding>
      <ListItemButton onClick={onToggleTheme}>
        <ListItemIcon><ContrastIcon /></ListItemIcon>
        <ListItemText primary="テーマ切替" />
      </ListItemButton>
    </ListItem>
    
    <Divider component="li" sx={{ mt: 4 }} />
    
    <ListItem disablePadding sx={{ mt: 4 }}>
      <ListItemButton component={Link} to="/users" onClick={onClickItem} selected={location.pathname === '/users'}>
        <ListItemIcon><PeopleIcon /></ListItemIcon>
        <ListItemText primary="ユーザ一覧" />
      </ListItemButton>
    </ListItem>
    
    {userState.role === 'Admin' && <>
      <Divider component="li" sx={{ mt: 4 }} />
      
      <ListItem disablePadding sx={{ mt: 4 }}>
        <ListItemButton component={Link} to="/admin" onClick={onClickItem} selected={location.pathname === '/admin'}>
          <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
          <ListItemText primary="管理者用" />
        </ListItemButton>
      </ListItem>
    </>}
    
    <Divider component="li" sx={{ mt: 4 }} />
    
    <ListItem disablePadding sx={{ mt: 4 }}>
      <ListItemButton onClick={onLogout}>
        <ListItemIcon><LogoutIcon /></ListItemIcon>
        <ListItemText primary="ログアウト" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton onClick={() => window.open('https://github.com/Neos21/pseudo')}>
        <ListItemIcon><GitHubIcon /></ListItemIcon>
        <ListItemText primary="GitHub" />
      </ListItemButton>
    </ListItem>
  </List>;
};
