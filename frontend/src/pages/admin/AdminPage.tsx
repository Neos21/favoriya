import { FC } from 'react';

import { Typography } from '@mui/material';

import { ServerMetricsComponent } from './components/ServerMetricsComponent/ServerMetricsComponent';
import { UsersWithLatestLoginComponent } from './components/UsersWithLatestLoginComponent/UsersWithLatestLoginComponent';

/** Admin Page */
export const AdminPage: FC = () => {
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>管理者用</Typography>
    
    <ServerMetricsComponent />
    
    <UsersWithLatestLoginComponent />
  </>;
};
