import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminPage } from '../../pages/admin/AdminPage';
import { AdminEmojisPage } from '../../pages/admin/emojis/AdminEmojisPage';
import { ShumaiPage } from '../../pages/admin/shumai/ShumaiPage';

import type { RootState } from '../../shared/stores/store';

/** 管理者権限用ガード */
export const AdminGuardRoute: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  
  // 管理者でなかったらトップに遷移させる
  if(userState.role !== 'Admin') return <Navigate to="/" />;
  
  // ログインできていたらルーティングを注入する
  return <Routes>
    <Route path="/emojis" element={<AdminEmojisPage />} />
    <Route path="/shumai" element={<ShumaiPage      />} />
    <Route path="/"       element={<AdminPage       />} />
  </Routes>;
};
