import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { isEmptyString } from '../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';

import type { RootState } from '../../shared/stores/store';

/** Home Page : Auth Check */
export const HomePage: FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const userState = useSelector((state: RootState) => state.user);
  
  // 1回だけ実行するため必要
  useEffect(() => {
    // Store に情報が復元済ならログイン済とする
    setIsLoggedIn(!isEmptyString(userState.id));
    setIsLoading(false);
  }, [dispatch, userState]);
  
  // ロード中
  if(isLoading) return <LoadingSpinnerComponent />;
  
  // ログインできていなかったらログイン画面に遷移する
  if(!isLoggedIn) return <Navigate to="/login" />;
  
  // ログインできていたらホームタイムライン画面に遷移する
  return <Navigate to="/home-timeline" />;
};
