import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { isEmptyString } from '../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { httpStatus } from '../../shared/constants/http-status';
import { userConstants } from '../../shared/constants/user-constants';
import { setUser } from '../../shared/stores/user-slice';

import type { RootState } from '../../shared/stores/store';
import type { User, UserApi } from '../../common/types/user';
import type { Result } from '../../common/types/result';

/** 認証ガード */
export const AuthGuardRoute: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const userState = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    // Store に情報が復元済
    if(!isEmptyString(userState.id)) {
      setIsLoggedIn(true);
      return setIsLoading(false);
    }
    
    // LocalStorage にユーザ情報が格納されていなければ未ログインとする
    const userStringified = localStorage.getItem(userConstants.localStorageKey);
    if(userStringified == null) {
      setIsLoggedIn(false);
      return setIsLoading(false);
    }
    
    // LocalStorage から情報を復元しログイン済とする・画面描画を開始する
    let user: User;
    try {
      user = JSON.parse(userStringified);
      dispatch(setUser(user));
      setIsLoggedIn(true);
      setIsLoading(false);
    }
    catch(error) {
      console.error('LocalStorage からのユーザ情報パースに失敗', error);
      setIsLoggedIn(false);
      return setIsLoading(false);
    }
    
    // API コールして最新の情報を取得し直す
    (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {  // Throws
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ id: user.id })
        });
        if(response.status !== httpStatus.ok) throw new Error(String(response.status));
        const refreshResult: Result<UserApi> = await response.json();  // Throws
        if(refreshResult.error != null) throw new Error(refreshResult.error);
        
        const refreshedUser: User = snakeToCamelCaseObject(refreshResult.result);
        dispatch(setUser(refreshedUser));  // Store に保存する
        localStorage.setItem(userConstants.localStorageKey, JSON.stringify(refreshedUser));
        setIsLoggedIn(true);
        setIsLoading(false);
      }
      catch(error) {
        console.error('Refresh API のコールに失敗', error);
        setIsLoggedIn(false);
        setIsLoading(false);
        navigate('/login');
      }
    })();
  }, [dispatch, navigate, userState]);
  
  // ロード中
  if(isLoading) return <LoadingSpinnerComponent />;
  
  // ログインできていなかったらログイン画面に遷移する
  if(!isLoggedIn) return <Navigate to="/login" />;
  
  // ログインできていたら対象画面を表示する
  return <Outlet />;
};
