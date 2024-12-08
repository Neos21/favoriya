import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { userConstants } from '../../../shared/constants/user-constants';
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
  
  // 未ログイン
  if(isEmptyString(userState.id)) return (
    <List>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/login" onClick={onClickItem} selected={location.pathname === '/login'}>
          <ListItemIcon><LoginIcon /></ListItemIcon>
          <ListItemText primary="ログイン" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/signup" onClick={onClickItem} selected={location.pathname === '/signup'}>
          <ListItemIcon><AssignmentTurnedInIcon /></ListItemIcon>
          <ListItemText primary="登録" />
        </ListItemButton>
      </ListItem>
    </List>
  );
  
  /** On Click */
  const onLogout = () => {
    onClickItem();
    dispatch(setUser(Object.assign({}, initialUserState)));
    localStorage.removeItem(userConstants.localStorageKey);
    navigate('/');
  };
  
  // ログイン済
  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/" onClick={onClickItem} selected={location.pathname === '/'}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="ホーム" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton disabled>
          <ListItemIcon><NotificationsIcon /></ListItemIcon>
          <ListItemText primary="通知" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton disabled>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
          <ListItemText primary="プロフィール" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/settings" onClick={onClickItem} selected={location.pathname === '/settings'}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="設定" />
        </ListItemButton>
      </ListItem>
      
      <Divider component="li" sx={{ mt: 4 }} />
      
      <ListItem disablePadding sx={{ mt: 4 }}>
        <ListItemButton onClick={onLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="ログアウト" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};
