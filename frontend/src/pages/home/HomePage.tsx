import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../shared/constants/user-constants';

import type { RootState } from '../../shared/stores/store';

/** Home Page : Auth Check */
export const HomePage: FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const userState = useSelector((state: RootState) => state.user);
  
  // 1回だけ実行するため必要
  useEffect(() => {
    // LocalStorage にユーザ情報が格納されているかだけ確認する・UserState への復元は AuthGuardRoute で行う
    const userStringified = localStorage.getItem(userConstants.localStorageKey);
    setIsLoggedIn(userStringified != null);
    setIsLoading(false);
  }, [dispatch, userState]);
  
  // ロード中
  if(isLoading) return <LoadingSpinnerComponent />;
  
  // ログインできていなかったらログイン画面に遷移する
  if(!isLoggedIn) return <Navigate to="/login" />;
  
  // ログインできていたらグローバルタイムライン画面に遷移する
  return <Navigate to="/global-timeline" />;
};
