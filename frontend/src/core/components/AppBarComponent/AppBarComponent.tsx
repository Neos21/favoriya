import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PublicIcon from '@mui/icons-material/Public';
import { AppBar, Avatar, Grid2, IconButton, Toolbar } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { userConstants } from '../../../shared/constants/user-constants';
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
  
  return <AppBar position="fixed" sx={{ paddingLeft: (isNarrowWindow ? 0 : `${drawerWidth}px`), paddingRight: '0 !important' }} className="app-bar-component">
    <Toolbar>
      <Grid2 container spacing={3} width="100%">
        {isNarrowWindow &&
          <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
            <IconButton size="large" color="inherit" onClick={onToggleDrawer} className="app-bar-component-icon-active">
              <MenuIcon />
            </IconButton>
          </Grid2>
        }
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/home-timeline" className={ location.pathname === '/home-timeline' ? 'app-bar-component-icon-active' : 'app-bar-component-icon' }>
            <HomeIcon />
          </IconButton>
        </Grid2>
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/global-timeline" className={ location.pathname === '/global-timeline' ? 'app-bar-component-icon-active' : 'app-bar-component-icon' }>
            <PublicIcon />
          </IconButton>
        </Grid2>
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to="/notifications" className={ location.pathname === '/notifications' ? 'app-bar-component-icon-active' : 'app-bar-component-icon' }>
            <NotificationsIcon />
          </IconButton>
        </Grid2>
        
        <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
          <IconButton size="large" color="inherit" component={Link} to={`/@${userState.id}`} className={ location.pathname === `/@${userState.id}` || !isEmptyString(userState.avatarUrl) ? 'app-bar-component-icon-active' : 'app-bar-component-icon' }>
            { isEmptyString(userState.avatarUrl) && <AccountCircleIcon />}
            {!isEmptyString(userState.avatarUrl) && <Avatar src={`${userConstants.ossUrl}${userState.avatarUrl}`} sx={{ width: '24px', height: '24px' }} />}
          </IconButton>
        </Grid2>
      </Grid2>
    </Toolbar>
  </AppBar>;
};
