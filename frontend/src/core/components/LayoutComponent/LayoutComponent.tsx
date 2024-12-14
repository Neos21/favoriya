import { FC, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Box, Container, Drawer, useMediaQuery } from '@mui/material';

import { AppBarComponent } from '../AppBarComponent/AppBarComponent';
import { MenuComponent } from '../MenuComponent/MenuComponent';

/** Layout Component */
export const LayoutComponent: FC = () => {
  const drawerWidth = 240;
  
  const location = useLocation();
  const isNarrowWindow = useMediaQuery('(max-width: 599.98px)');  // 画面幅が 600px 以内かどうか
  
  const [isOpen, setIsOpen] = useState<boolean>(false);  // Drawer を開いているか否か
  
  const onCloseDrawer = () => setIsOpen(false);
  
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
      <AppBarComponent drawerWidth={drawerWidth} isNarrowWindow={isNarrowWindow} onToggleDrawer={() => setIsOpen(!isOpen)} />
      
      {/* AppBar の高さが 64px あるため padding-top を指定している */}
      <Container maxWidth="md" sx={{ minWidth: 300, paddingTop: (isNarrowWindow ? '56px' : '64px'), paddingBottom: 4 }}>
        <Outlet />
      </Container>
    </Box>
  </Box>;
};
