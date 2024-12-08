import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material';

import { RootState } from '../../shared/stores/store';
import { ChangePasswordFormComponent } from './components/ChangePasswordFormComponent/ChangePasswordFormComponent';
import { UserInfoFormComponent } from './components/UserInfoFormComponent/UserInfoFormComponent';

/** Settings Page */
export const SettingsPage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  
  return (<>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>設定</Typography>
    
    <Divider sx={{ mt: 4 }} />
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>プロフィール</Typography>
    <List sx={{ mt: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <ListItem><ListItemText primary="ユーザ ID" secondary={`@${userState.id}`} /></ListItem>
      <Divider component="li" variant="middle" />
      <ListItem><ListItemText primary="ロール" secondary={userState.role} /></ListItem>
    </List>
    
    <Divider sx={{ mt: 4 }} />
    <UserInfoFormComponent />
    
    <Divider sx={{ mt: 4 }} />
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>アバター変更</Typography>
    <Typography component="p" sx={{ mt: 3 }}>
      <Link to="/settings/change-avatar" className="hover-underline">アバター変更画面に移動する</Link>
    </Typography>
    
    <Divider sx={{ mt: 4 }} />
    <ChangePasswordFormComponent />
  </>);
};
