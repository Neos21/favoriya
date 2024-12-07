import { FC } from 'react';

import { Divider, Typography } from '@mui/material';

import { UserInfoFormComponent } from './components/UserInfoFormComponent/UserInfoFormComponent';

/** Settings Page */
export const SettingsPage: FC = () => {
  return (<>
    <Typography component="h1" variant="h4" marginY={2}>Settings</Typography>
    <Divider sx={{ my: 4 }} />
    
    <UserInfoFormComponent />
  </>);
};
