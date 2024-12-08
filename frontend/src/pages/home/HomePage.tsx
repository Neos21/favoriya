import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { isEmptyString } from '../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../shared/constants/user-constants';
import { setUser } from '../../shared/stores/user-slice';
import { GlobalTimelinePage } from '../global-timeline/GlobalTimelinePage';

import type { User } from '../../common/types/user';
import type { RootState } from '../../shared/stores/store';

/** Home Page : Auth Check */
export const HomePage: FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const userState = useSelector((state: RootState) => state.user);
  
  // 1回だけ実行するため必要
  useEffect(() => {
    // Store に情報が復元済
    if(!isEmptyString(userState.id)) {
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
  }, [dispatch, userState]);
  
  // ロード中
  if(isLoading) return <LoadingSpinnerComponent />;
  
  // ログインできていなかったらログイン画面に遷移する
  if(!isLoggedIn) return <Navigate to="/login" />;
  
  // ログインできていたらグローバルタイムラインを表示する
  return <GlobalTimelinePage />;
};
