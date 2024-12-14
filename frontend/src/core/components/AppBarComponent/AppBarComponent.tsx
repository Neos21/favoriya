import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PublicIcon from '@mui/icons-material/Public';
import { AppBar, Grid2, IconButton, Toolbar } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { RootState } from '../../../shared/stores/store';

type Props = {
  drawerWidth   : number,
  isNarrowWindow: boolean,
  onToggleDrawer: () => void
};

/** App Bar Component */
export const AppBarComponent: FC<Props> = ({ drawerWidth, isNarrowWindow, onToggleDrawer }) => {
  const location = useLocation();
  const userState = useSelector((state: RootState) => state.user);
  
  // 画面遷移ごとに実行する
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // 未ログイン
  if(isEmptyString(userState.id)) return<AppBar position="fixed" sx={{ paddingLeft: (isNarrowWindow ? 0 : `${drawerWidth}px`), paddingRight: '0 !important' }}>
    <Toolbar>
      <Grid2 container spacing={3} width="100%">
        {isNarrowWindow &&
          <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
            <IconButton size="large" color="inherit" onClick={onToggleDrawer}>
              <MenuIcon />
            </IconButton>
          </Grid2>
        }
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/login" className={ location.pathname === '/login' ? 'app-bar-icon-active' : 'app-bar-icon' }>
            <LoginIcon />
          </IconButton>
        </Grid2>
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/signup" className={ location.pathname === '/signup' ? 'app-bar-icon-active' : 'app-bar-icon' }>
            <AssignmentTurnedInIcon />
          </IconButton>
        </Grid2>
      </Grid2>
    </Toolbar>
  </AppBar>;
  
  // ログイン済
  return <AppBar position="fixed" sx={{ paddingLeft: (isNarrowWindow ? 0 : `${drawerWidth}px`), paddingRight: '0 !important' }}>
    <Toolbar>
      <Grid2 container spacing={3} width="100%">
        {isNarrowWindow &&
          <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
            <IconButton size="large" color="inherit" onClick={onToggleDrawer}>
              <MenuIcon />
            </IconButton>
          </Grid2>
        }
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/home-timeline" className={ location.pathname === '/home-timeline' ? 'app-bar-icon-active' : 'app-bar-icon' }>
            <HomeIcon />
          </IconButton>
        </Grid2>
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/global-timeline" className={ location.pathname === '/global-timeline' ? 'app-bar-icon-active' : 'app-bar-icon' }>
            <PublicIcon />
          </IconButton>
        </Grid2>
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/notifications" className={ location.pathname === '/notifications' ? 'app-bar-icon-active' : 'app-bar-icon' }>
            <NotificationsIcon />
          </IconButton>
        </Grid2>
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to={`/@${userState.id}`}
            className={ location.pathname === `/@${userState.id}` ? 'app-bar-icon-active' : 'app-bar-icon' }
            disabled={isEmptyString(userState.id)}
          >
            <AccountCircleIcon />
          </IconButton>
        </Grid2>
      </Grid2>
    </Toolbar>
  </AppBar>;
};
