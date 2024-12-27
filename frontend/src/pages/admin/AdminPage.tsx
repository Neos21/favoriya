import { FC } from 'react';
import { Link } from 'react-router-dom';

import { Typography } from '@mui/material';

import { ServerMetricsComponent } from './components/ServerMetricsComponent/ServerMetricsComponent';
import { UsersWithLatestLoginComponent } from './components/UsersWithLatestLoginComponent/UsersWithLatestLoginComponent';

/** Admin Page */
export const AdminPage: FC = () => {
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>管理者用</Typography>
    
    <ul>
      <li><Link to="/admin/shumai" className="normal-link">しゅうまい君</Link></li>
      <li><Link to="/admin/emojis" className="normal-link">絵文字リアクション管理</Link></li>
    </ul>
    
    <ServerMetricsComponent />
    
    <UsersWithLatestLoginComponent />
  </>;
};
