import { FC, Fragment, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Alert, Avatar, Button, Divider, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../../shared/constants/user-constants';
import { useApiGet } from '../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../common/types/result';
import type { User, UserApi } from '../../../common/types/user';

/** Followings Page */
export const FollowingsPage: FC = () => {
  const { userId: rawParamUserId } = useParams<{ userId: string }>();
  
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [followingUsers, setFollowingUsers] = useState<Array<User>>([]);
  
  // 念のため `@` を除去するテイで作っておく
  const paramUserId = rawParamUserId.startsWith('@') ? rawParamUserId.slice(1) : rawParamUserId;
  
  // 初回読み込み
  useEffect(() => {
    setStatus('loading');
    if(!rawParamUserId.startsWith('@')) return;  // 先頭に `@` が付いていなかった場合は何もしない
    
    (async () => {
      try {
        const response = await apiGet(`/users/${paramUserId}/followings`);  // Throws
        const followingUsersApiResult: Result<Array<UserApi>> = await response.json();  // Throws
        if(followingUsersApiResult.error != null) return setStatus('failed');
        
        setFollowingUsers(followingUsersApiResult.result.map(followingUserApi => snakeToCamelCaseObject(followingUserApi)));
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('フォロー中一覧の取得に失敗', error);
      }
    })();
  }, [apiGet, paramUserId, rawParamUserId]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={`/@${rawParamUserId}/followings`} />;
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>@{paramUserId} : フォロー中一覧</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status !== 'loading' && <Typography component="p" sx={{ mt: 3 }}>
      <Button component={Link} to={`/@${paramUserId}`} variant="contained">戻る</Button>
    </Typography>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>フォロー中一覧の取得に失敗</Alert>}
    
    {status === 'succeeded' && followingUsers.length === 0 && <Typography component="p" sx={{ mt: 3 }}>フォロー中ユーザは存在しません</Typography>}
    
    {status === 'succeeded' && followingUsers.length > 0 && <>
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>全 {followingUsers.length} 人</Typography>
      <List sx={{ mt: 3 }}>
        <Divider component="li" />
        {followingUsers.map(followingUser => <Fragment key={followingUser.id}>
          <ListItem alignItems="center" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar src={isEmptyString(followingUser.avatarUrl) ? '' : `${userConstants.ossUrl}${followingUser.avatarUrl}`} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Grid2 container spacing={1}>
                  <Grid2 size={6} sx={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    <Link to={`/@${followingUser.id}`} className="hover-underline">{followingUser.name}</Link>
                  </Grid2>
                  <Grid2 size={6} sx={{ color: '#999', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    @{followingUser.id}
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
