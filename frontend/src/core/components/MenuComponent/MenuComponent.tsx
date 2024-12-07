import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

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

/** Menu Component */
export const MenuComponent: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.user);
  
  // 未ログイン
  if(isEmptyString(userState.id)) return (
    <List>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/login">
          <ListItemIcon><LoginIcon /></ListItemIcon>
          <ListItemText primary="Login" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/signup">
          <ListItemIcon><AssignmentTurnedInIcon /></ListItemIcon>
          <ListItemText primary="Signup" />
        </ListItemButton>
      </ListItem>
    </List>
  );
  
  /** On Click */
  const onLogout = () => {
    dispatch(setUser(Object.assign({}, initialUserState)));
    localStorage.removeItem(userConstants.localStorageKey);
    navigate('/');
  };
  
  // ログイン済
  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton disabled>
          <ListItemIcon><NotificationsIcon /></ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton disabled>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </ListItem>
      
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/settings">
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </ListItem>
      
      <Divider component="li" sx={{ marginTop: 4 }} />
      
      <ListItem disablePadding>
        <ListItemButton onClick={onLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};
