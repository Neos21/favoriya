import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';

import { Box, Container, Drawer, useMediaQuery } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { useApiGet } from '../../../shared/hooks/use-api-fetch';
import { setUnreadNotifications } from '../../../shared/stores/notifications-slice';
import { AppBarComponent } from '../AppBarComponent/AppBarComponent';
import { MenuComponent } from '../MenuComponent/MenuComponent';

import type { RootState } from '../../../shared/stores/store';
import type { Result } from '../../../common/types/result';

/** Layout Component */
export const LayoutComponent: FC = () => {
  const drawerWidth = 240;
  
  const location = useLocation();
  const dispatch = useDispatch();
  const isNarrowWindow = useMediaQuery('(max-width: 599.98px)');  // 画面幅が 600px 以内かどうか
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  
  const [isOpen, setIsOpen] = useState<boolean>(false);  // Drawer を開いているか否か
  
  const onCloseDrawer = () => setIsOpen(false);
  
  // 画面初期表示時に未読件数を取得する
  useEffect(() => {
    (async () => {
      try {
        if(userState == null || isEmptyString(userState.id)) return;
        const response = await apiGet('/notifications/number-of-unreads', `?user_id=${userState.id}`);
        const result: Result<number> = await response.json();
        dispatch(setUnreadNotifications({ unreadNotifications: result.result }));
      }
      catch(error) {
        console.warn('未読件数の取得に失敗', error);
      }
    })();
  }, [apiGet, dispatch, userState, userState.id]);
  
  // 画面遷移ごとに実行する
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // 未ログイン時は枠を出さない
  if(isEmptyString(userState.id)) return <Outlet />;
  
  return <Box component="div" sx={{ display: 'flex', height: '100vh' }}>
    <Drawer
      variant={isNarrowWindow ? 'temporary' : 'persistent'}
      open={isNarrowWindow ? isOpen : true}
      onClose={onCloseDrawer}
      className="layout-component-drawer"
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
