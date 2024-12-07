import { FC } from 'react';
import { useSelector } from 'react-redux';

import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material';

import { RootState } from '../../shared/stores/store';
import { ChangePasswordFormComponent } from './components/ChangePasswordFormComponent/ChangePasswordFormComponent';
import { UserInfoFormComponent } from './components/UserInfoFormComponent/UserInfoFormComponent';

/** Settings Page */
export const SettingsPage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  
  return (<>
    <Typography component="h1" variant="h4" marginY={2}>Settings</Typography>
    <Divider sx={{ my: 4 }} />
    
    <Typography component="h2" variant="h5" marginY={2}>Profile</Typography>
    <List dense sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <ListItem><ListItemText primary="User ID" secondary={userState.id} /></ListItem>
      <Divider variant="middle" component="li" />
      <ListItem><ListItemText primary="Role" secondary={userState.role} /></ListItem>
    </List>
    <Divider sx={{ my: 4 }} />
    
    <UserInfoFormComponent />
    <Divider sx={{ my: 4 }} />
    
    <ChangePasswordFormComponent />
  </>);
};
