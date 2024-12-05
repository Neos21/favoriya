import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { userConstants } from '../../shared/constants/user-constants';
import { RootState } from '../../shared/stores/store';
import { setUser } from '../../shared/stores/user-slice';
import { GlobalTimelinePage } from '../global-timeline/GlobalTimelinePage';

import type { User } from '../../common/types/user';

/** Home Page : Auth Check */
export const HomePage: FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const userState = useSelector((state: RootState) => state.user);
  
  // 1回だけ実行するため必要
  useEffect(() => {
    // Store に情報が復元済
    if(userState?.token != null && userState.token !== '') {
      setIsLoggedIn(true);
      setIsLoading(false);
      return;
    }
    
    // LocalStorage にユーザ情報が格納されていればログイン済とする
    const userStringified = localStorage.getItem(userConstants.localStorageKey);
    if(userStringified != null) {
      const user: User = JSON.parse(userStringified);
      dispatch(setUser(user));
    }
    setIsLoggedIn(userStringified != null);
    setIsLoading(false);
  }, [dispatch, userState.token]);
  
  // ロード中
  if(isLoading) return <></>;  // TODO : 少し経ってからスピナーを表示する
  
  // ログインできていなかったらログイン画面に遷移する
  if(!isLoggedIn) return <Navigate to="/login" />;
  
  // ログインできていたらグローバルタイムラインを表示する
  return <GlobalTimelinePage />;
};
