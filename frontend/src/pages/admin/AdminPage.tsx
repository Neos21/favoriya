import { FC } from 'react';
import { Link } from 'react-router-dom';

import { Typography } from '@mui/material';

import { ServerMetricsComponent } from './components/ServerMetricsComponent/ServerMetricsComponent';
import { UsersWithLatestLoginComponent } from './components/UsersWithLatestLoginComponent/UsersWithLatestLoginComponent';

/** Admin Page */
export const AdminPage: FC = () => {
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>管理者用</Typography>
    
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>絵文字リアクション管理</Typography>
    <Typography component="p" sx={{ mt: 3 }}>
      <Link to="/admin/emojis" className="hover-underline">絵文字リアクション管理画面に移動する</Link>
    </Typography>
    
    <ServerMetricsComponent />
    
    <UsersWithLatestLoginComponent />
  </>;
};
