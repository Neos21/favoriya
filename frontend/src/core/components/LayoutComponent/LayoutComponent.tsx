import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AppBar, Box, Container, Drawer, Grid2, IconButton, Toolbar, useMediaQuery } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { RootState } from '../../../shared/stores/store';
import { MenuComponent } from '../MenuComponent/MenuComponent';

/** Layout Component */
export const LayoutComponent: FC = () => {
  const drawerWidth = 240;
  
  const location = useLocation();
  const isNarrowWindow = useMediaQuery('(max-width: 599.98px)');  // 画面幅が 600px 以内かどうか
  const userState = useSelector((state: RootState) => state.user);
  
  const [isOpen, setIsOpen] = useState<boolean>(false);  // Drawer を開いているか否か
  
  const onCloseDrawer = () => setIsOpen(false);
  const onToggleDrawer = () => setIsOpen(!isOpen);
  
  // 画面遷移ごとに実行する
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return <Box component="div" sx={{ display: 'flex', height: '100vh' }}>
    <Drawer
      variant={isNarrowWindow ? 'temporary' : 'persistent'}
      open={isNarrowWindow ? isOpen : true}
      onClose={onCloseDrawer}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth }
      }}
    >
      <MenuComponent onClickItem={onCloseDrawer} />
    </Drawer>
    
    <Box component="div" sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ paddingLeft: (isNarrowWindow ? 0 : `${drawerWidth}px`), paddingRight: '0 !important' }}>
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
              <IconButton size="large" color="inherit" component={Link} to="/global-timeline" className={ location.pathname === '/global-timeline' ? 'app-bar-icon-active' : 'app-bar-icon' }>
                <HomeIcon />
              </IconButton>
            </Grid2>
            
            <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
              <IconButton size="large" color="inherit" disabled>
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
      </AppBar>
      
      {/* AppBar の高さが 64px あるため padding-top を指定している */}
      <Container maxWidth="md" sx={{ minWidth: 300, paddingTop: (isNarrowWindow ? '56px' : '64px'), paddingBottom: 4 }}>
        <Outlet />
      </Container>
    </Box>
  </Box>;
};
