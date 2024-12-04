import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { Container, Typography } from '@mui/material';

import { setUser } from '../../shared/stores/user-slice';
import { GlobalTimelinePage } from '../global-timeline/GlobalTimeline';

import type { User } from '../../common/types/user';

/** Home Page : Auth Check */
export const HomePage: FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // LocalStorage にユーザ情報が格納されていればログイン済とする
  useEffect(() => {
    const userStringified = localStorage.getItem('user');
    if(userStringified != null) {
      const user: User = JSON.parse(userStringified);
      console.log('LocalStorage よりユーザ情報を復元', user);
      dispatch(setUser(user));
    }
    setIsLoggedIn(userStringified != null);
    setIsLoading(false);
  }, [dispatch]);
  
  // ロード中
  if(isLoading) return (
    <Container maxWidth="sm">
      <Typography component="h1" variant="h4" marginY={2}>Pseudo : Loading...</Typography>
    </Container>
  );
  
  // ログインできていなかったらログイン画面に遷移する
  if(!isLoggedIn) return <Navigate to="/login" />;
  
  // ログインできていたらグローバルタイムラインを表示する
  return <GlobalTimelinePage />;
};
