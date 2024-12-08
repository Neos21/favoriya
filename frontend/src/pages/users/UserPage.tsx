import { FC, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { Alert, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostsListComponent } from '../../shared/components/PostsListComponent/PostsListComponent';
import { useApiGet } from '../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../shared/services/convert-date-to-jst';

import type { Post, PostApi } from '../../common/types/post';
import type { Result } from '../../common/types/result';
import type { User, UserApi } from '../../common/types/user';

/** User Page */
export const UserPage: FC = () => {
  const { userId: rawParamUserId } = useParams<{ userId: string }>();
  
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [user, setUser] = useState<User>(null);
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  // 念のため `@` を除去するテイで作っておく
  const paramUserId = rawParamUserId.startsWith('@') ? rawParamUserId.slice(1) : rawParamUserId;
  
  // 初回読み込み
  useEffect(() => {
    setStatus('loading');
    if(!rawParamUserId.startsWith('@')) return;  // 先頭に `@` が付いていなかった場合は何もしない
    (async () => {
      try {
        const response = await apiGet(`/users/${paramUserId}`);  // Throws
        const userApi: Result<UserApi> = await response.json();  // Throws
        if(userApi.error != null) return setStatus('failed');
        
        setUser(snakeToCamelCaseObject(userApi.result));
      }
      catch(error) {
        setStatus('failed');
        return console.error('ユーザ情報の取得に失敗しました', error);
      }
      
      try {
        const response = await apiGet(`/users/${paramUserId}/posts`);  // Throws
        const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
        if(postsApi.error != null) return setStatus('failed');
        
        setPosts(postsApi.result.map(postApi => snakeToCamelCaseObject(postApi)));
      }
      catch(error) {
        setStatus('failed');
        return console.error('該当ユーザの投稿の取得に失敗しました', error);
      }
      
      setStatus('succeeded');
    })();
  }, [apiGet, paramUserId, rawParamUserId]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={'/@' + rawParamUserId } />;
  
  return (<>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>@{paramUserId}</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>ユーザ情報の取得に失敗しました</Alert>}
    
    {status === 'succeeded' && <>
      <List sx={{ mt: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <ListItem><ListItemText primary="ユーザ ID" secondary={'@' + user.id} /></ListItem>
        <Divider component="li" variant="middle" />
        <ListItem><ListItemText primary="ユーザ名" secondary={user.name} /></ListItem>
        <Divider component="li" variant="middle" />
        <ListItem><ListItemText primary="ロール" secondary={user.role} /></ListItem>
        <Divider component="li" variant="middle" />
        <ListItem><ListItemText primary="登録日" secondary={epochTimeMsToJstString(user.createdAt as string, 'YYYY-MM-DD')} /></ListItem>
      </List>
      
      <Typography component="p" sx={{ mt: 3 }}>現在、ユーザの投稿は直近の50件を表示しています。</Typography>
      
      <PostsListComponent posts={posts} />
    </>}
  </>);
};
