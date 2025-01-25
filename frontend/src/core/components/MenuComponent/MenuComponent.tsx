import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ContrastIcon from '@mui/icons-material/Contrast';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, Badge, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { themeConstants } from '../../../shared/constants/theme-constants';
import { userConstants } from '../../../shared/constants/user-constants';
import { useThemeMode } from '../../../shared/hooks/use-theme-mode';
import { initialUserState, setUser } from '../../../shared/stores/user-slice';

import type { RootState } from '../../../shared/stores/store';

type Props = {
  onClickItem: () => void
};

/** Menu Component */
export const MenuComponent: FC<Props> = ({ onClickItem }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userState = useSelector((state: RootState) => state.user);
  const notificationsState = useSelector((state: RootState) => state.notifications);
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
        <ListItemIcon>
          <Badge badgeContent={notificationsState.unreadNotifications} color="error" sx={{ whiteSpace: 'nowrap' }}>
            <NotificationsIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText primary="通知" />
      </ListItemButton>
    </ListItem>
    
    <ListItem disablePadding>
      <ListItemButton component={Link} to="/search" onClick={onClickItem} selected={location.pathname.startsWith('/search')}>
        <ListItemIcon><SearchIcon /></ListItemIcon>
        <ListItemText primary="検索" />
      </ListItemButton>
    </ListItem>
    
    <ListItem disablePadding>
      <ListItemButton component={Link} to={`/@${userState.id}`} onClick={onClickItem} selected={location.pathname === `/@${userState.id}`}>
        <ListItemIcon>
          { isEmptyString(userState.avatarUrl) && <AccountCircleIcon />}
          {!isEmptyString(userState.avatarUrl) && <Avatar src={`${userConstants.ossUrl}${userState.avatarUrl}`} sx={{ width: '24px', height: '24px' }} />}
        </ListItemIcon>
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
    
    <ListItem disablePadding>
      <ListItemButton component={Link} to="/emojis" onClick={onClickItem} selected={location.pathname === '/emojis'}>
        <ListItemIcon><EmojiEmotionsIcon /></ListItemIcon>
        <ListItemText primary="絵文字登録" />
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
      <ListItemButton onClick={() => window.open('https://github.com/Neos21/favoriya')}>
        <ListItemIcon><GitHubIcon /></ListItemIcon>
        <ListItemText primary="GitHub" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton onClick={() => window.open('https://misskey.neos21.net')}>
        <ListItemIcon><img src="/public/misskey-64.png" width="24" height="24" /></ListItemIcon>
        <ListItemText primary="ねゃおすきー" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton onClick={() => window.open('https://discord.com/invite/xhkC2GMtef')}>
        <ListItemIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor" width="24px" height="24px">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
        </ListItemIcon>
        <ListItemText primary="Neo's Discord" />
      </ListItemButton>
    </ListItem>
  </List>;
};
