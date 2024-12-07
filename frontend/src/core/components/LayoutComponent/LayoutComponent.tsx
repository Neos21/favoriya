import { FC, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AppBar, Box, Container, Drawer, Grid2, IconButton, Toolbar, useMediaQuery } from '@mui/material';

import { MenuComponent } from '../MenuComponent/MenuComponent';

/** Layout Component */
export const LayoutComponent: FC = () => {
  const drawerWidth = 240;
  
  const [isOpen, setIsOpen] = useState(false);  // Drawer を開いているか否か
  const isNarrowWindow = useMediaQuery('(max-width: 599.98px)');  // 画面幅が 600px 以内かどうか
  
  const toggleDrawer = () => setIsOpen(!isOpen);
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant={isNarrowWindow ? 'temporary' : 'persistent'}
        open={isNarrowWindow ? isOpen : true}
        onClose={toggleDrawer}  // temporary の場合の閉じる処理
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth }
        }}
      >
        <MenuComponent />
      </Drawer>
      
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ paddingLeft: (isNarrowWindow ? 0 : `${drawerWidth}px`) }}>
          <Toolbar>
            <Grid2 container spacing={3} width="100%">
              {isNarrowWindow &&
                <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
                  <IconButton size="large" color="inherit" onClick={toggleDrawer}>
                    <MenuIcon />
                  </IconButton>
                </Grid2>
              }
              
              <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
                <IconButton size="large" color="inherit" component={Link} to="/">
                  <HomeIcon />
                </IconButton>
              </Grid2>
              
              <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
                <IconButton size="large" color="inherit" disabled>
                  <NotificationsIcon />
                </IconButton>
              </Grid2>
              
              <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
                <IconButton size="large" color="inherit" disabled>
                  <AccountCircleIcon />
                </IconButton>
              </Grid2>
            </Grid2>
          </Toolbar>
        </AppBar>
        
        {/* AppBar の高さが 64px あるため padding-top を指定している */}
        <Container maxWidth="md" sx={{ minWidth: 300, paddingTop: '64px', paddingBottom: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
