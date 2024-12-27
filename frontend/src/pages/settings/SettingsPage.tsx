import { FC } from 'react';
import { Link } from 'react-router-dom';

import { Divider, Typography } from '@mui/material';

import { ChangePasswordFormComponent } from './components/ChangePasswordFormComponent/ChangePasswordFormComponent';
import { UserInfoFormComponent } from './components/UserInfoFormComponent/UserInfoFormComponent';

/** Settings Page */
export const SettingsPage: FC = () => {
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>設定</Typography>
    
    <Divider sx={{ mt: 4 }} />
    <UserInfoFormComponent />
    
    <Divider sx={{ mt: 4 }} />
    <Typography component="h2" sx={{ mt: 3 }}>アバター変更</Typography>
    <ul>
      <li><Link to="/settings/change-avatar" className="normal-link">アバター変更画面に移動する</Link></li>
    </ul>
    
    <Divider sx={{ mt: 4 }} />
    <ChangePasswordFormComponent />
    
    <Divider sx={{ mt: 4 }} />
    <Typography component="h2" sx={{ mt: 3 }}>ログイン履歴</Typography>
    <ul>
      <li><Link to="/settings/login-histories" className="normal-link">ログイン履歴確認画面に移動する</Link></li>
    </ul>
    
    <Divider sx={{ mt: 4 }} />
    <Typography component="h2" sx={{ mt: 3 }}>アカウント削除</Typography>
    <ul>
      <li><Link to="/settings/delete-account" className="normal-link">アカウント削除確認画面に移動する</Link></li>
    </ul>
    
    <Divider sx={{ mt: 4 }} />
  </>;
};
