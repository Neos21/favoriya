import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, Box, Button, Divider, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../../common/helpers/convert-case';
import { isEmptyString } from '../../../../common/helpers/is-empty-string';
import { userConstants } from '../../../../shared/constants/user-constants';
import { useApiGet } from '../../../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../../../shared/services/convert-date-to-jst';

import type { Result } from '../../../../common/types/result';
import type { User, UserApi } from '../../../../common/types/user';

/** Users With Latest Login Component */
export const UsersWithLatestLoginComponent: FC = () => {
  const apiGet = useApiGet();
  
  const [users, setUsers] = useState<Array<User>>([]);
  
  const onLoadUsers = useCallback(async () => {
    try {
      const response = await apiGet('/admin/users-with-latest-login');
      const result: Result<Array<UserApi>> = await response.json();
      if(result.error != null) return setUsers(null);
      setUsers(result.result.map(userApi => snakeToCamelCaseObject(userApi)) as Array<User>);
    }
    catch(error) {
      setUsers(null);
      console.error('ユーザごとの最終ログイン日時取得に失敗', error);
    }
  }, [apiGet]);
  
  useEffect(() => {
    onLoadUsers();
  }, [onLoadUsers]);
  
  return <>
    <Typography component="h2" sx={{ mt: 3 }}>最終ログイン日時</Typography>
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" onClick={onLoadUsers}>再読込</Button>
    </Box>
    <List sx={{ mt: 3 }}>
      <Divider component="li" />
      {users.map(user => <Fragment key={user.id}>
        <ListItem alignItems="center" sx={{ px: 0 }}>
          <ListItemAvatar>
            <Avatar src={isEmptyString(user.avatarUrl) ? '' : `${userConstants.ossUrl}${user.avatarUrl}`} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Grid2 container spacing={1} sx={{ color: 'grey.600', whiteSpace: 'nowrap' }}>
                <Grid2 size={3} sx={{ color: 'text.primary', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Link to={`/@${user.id}`} className="hover-underline">{user.name}</Link>
                </Grid2>
                <Grid2 size={3} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{user.id}
                </Grid2>
                <Grid2 size={6}>
                  {user.updatedAt == null ? '-' : epochTimeMsToJstString(user.updatedAt as string, 'YYYY-MM-DD HH:mm:SS')}
                </Grid2>
              </Grid2>
            }
          />
        </ListItem>
        <Divider component="li" />
      </Fragment>)}
    </List>
  </>;
};
