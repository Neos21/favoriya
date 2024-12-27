import { FC, Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert, Avatar, Divider, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { isEmptyString } from '../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../shared/constants/user-constants';
import { useApiGet } from '../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../shared/services/convert-date-to-jst';

import type { Result } from '../../common/types/result';
import type { User, UserApi } from '../../common/types/user';

/** Users Page */
export const UsersPage: FC = () => {
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [users, setUsers] = useState<Array<User>>([]);
  
  // 初回読込
  useEffect(() => {
    setStatus('loading');
    (async () => {
      try {
        const response = await apiGet('/users');  // Throws
        const usersApiResult: Result<Array<UserApi>> = await response.json();  // Throws
        if(usersApiResult.error != null) return setStatus('failed');
        
        setUsers(usersApiResult.result.map(userApi => snakeToCamelCaseObject(userApi)) as Array<User>);
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('ユーザ情報一覧の取得に失敗', error);
      }
    })();
  }, [apiGet]);
  
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>ユーザ一覧</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>ユーザ情報一覧の取得に失敗</Alert>}
    
    {status === 'succeeded' && users.length === 0 && <Typography component="p" sx={{ mt: 3 }}>ユーザは登録されていません</Typography>}
    
    {status === 'succeeded' && users.length > 0 && <>
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>全 {users.length} 人</Typography>
      <List sx={{ mt: 3 }}>
        <Divider component="li" />
        <ListItem alignItems="center" sx={{ px: 0 }}>
          <ListItemText inset
            primary={
              <Grid2 container spacing={1} sx={{ fontWeight: 'bold' }}>
                <Grid2 size={{ xs: 6, sm: 6, md: 4 }}>ユーザ名</Grid2>
                <Grid2 size={{ xs: 6, sm: 6, md: 4 }}>ユーザ ID</Grid2>
                <Grid2 size={{ xs: 6, sm: 6, md: 2 }}>ロール</Grid2>
                <Grid2 size={{ xs: 6, sm: 6, md: 2 }}>登録日</Grid2>
              </Grid2>
            }
          />
        </ListItem>
        <Divider component="li" />
        {users.map(user => <Fragment key={user.id}>
          <ListItem alignItems="center" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar src={isEmptyString(user.avatarUrl) ? '' : `${userConstants.ossUrl}${user.avatarUrl}`} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Grid2 container spacing={1} sx={{ color: 'grey.600', whiteSpace: 'nowrap' }}>
                  <Grid2 size={{ xs: 6, sm: 6, md: 4 }} sx={{ color: 'text.primary', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Link to={`/@${user.id}`} className="hover-underline">{user.name}</Link>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 6, md: 4 }} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{user.id}
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 6, md: 2 }}>
                    {user.role}
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 6, md: 2 }}>
                    {epochTimeMsToJstString(user.createdAt as string, 'YYYY-MM-DD')}
                  </Grid2>
                </Grid2>
              }
            />
          </ListItem>
          <Divider component="li" />
        </Fragment>)}
      </List>
    </>}
  </>;
};
