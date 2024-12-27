import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';

import { Box, Container, Drawer, useMediaQuery } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { useApiGet } from '../../../shared/hooks/use-api-fetch';
import { dateToJstDate } from '../../../shared/services/convert-date-to-jst';
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
  
  useEffect(() => {
    // 画面初期表示時に未読件数を取得する
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
    
    // 背景画像を時間帯によって差し替える
    const setBackgroundImage = () => {
      const jstNow = dateToJstDate(new Date());
      const jstHour = jstNow.getHours();
      if(0 <= jstHour && jstHour < 4) {
        document.body.classList.add('midnight');
        document.body.classList.remove(            'sunrise', 'morning', 'noon', 'sunset', 'night');
      }
      else if(4 <= jstHour && jstHour < 8) {
        document.body.classList.add('sunrise');
        document.body.classList.remove('midnight',            'morning', 'noon', 'sunset', 'night');
      }
      else if(8 <= jstHour && jstHour < 12) {
        document.body.classList.add('morning');
        document.body.classList.remove('midnight', 'sunrise',            'noon', 'sunset', 'night');
      }
      else if(12 <= jstHour && jstHour < 16) {
        document.body.classList.add('noon');
        document.body.classList.remove('midnight', 'sunrise', 'morning',         'sunset', 'night');
      }
      else if(16 <= jstHour && jstHour < 20) {
        document.body.classList.add('sunset');
        document.body.classList.remove('midnight', 'sunrise', 'morning', 'noon',           'night');
      }
      else if(20 <= jstHour && jstHour < 24) {
        document.body.classList.add('night');
        document.body.classList.remove('midnight', 'sunrise', 'morning', 'noon', 'sunset'         );
      }
    };
    setBackgroundImage();
    const intervalId = setInterval(setBackgroundImage, 10 * 60 * 1000);  // 10分ごと
    
    return () => {
      clearInterval(intervalId);
      document.body.classList.remove('midnight', 'sunrise', 'morning', 'noon', 'sunset', 'night');
    };
  }, [apiGet, dispatch, userState, userState.id]);
  
  // 画面遷移ごとに実行する
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
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
