import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';

import { Alert, Button, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostsListComponent } from '../../shared/components/PostsListComponent/PostsListComponent';
import { httpStatus } from '../../shared/constants/http-status';
import { useApiGet } from '../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../shared/services/convert-date-to-jst';

import type { Post, PostApi } from '../../common/types/post';
import type { Result } from '../../common/types/result';
import type { User, UserApi } from '../../common/types/user';
import type { RootState } from '../../shared/stores/store';

/** User Page */
export const UserPage: FC = () => {
  const offsetAmount = 50;  // 50件ずつ読み込む
  
  const { userId: rawParamUserId } = useParams<{ userId: string }>();
  
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'not-found' | 'failed'>('loading');
  const [user, setUser] = useState<User>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isNextLoading, setIsNextLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
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
        const userApiResult: Result<UserApi> = await response.json();  // Throws
        if(userApiResult.error != null) return setStatus(response.status === httpStatus.notFound ? 'not-found' : 'failed');
        
        setUser(snakeToCamelCaseObject(userApiResult.result));
      }
      catch(error) {
        setStatus('failed');
        return console.error('ユーザ情報の取得に失敗', error);
      }
      
      try {
        const response = await apiGet(`/users/${paramUserId}/posts`, `?offset=0&limit=${offsetAmount}`);  // Throws
        const postsApiResult: Result<Array<PostApi>> = await response.json();  // Throws
        if(postsApiResult.error != null) return setStatus('failed');
        
        setPosts(postsApiResult.result.map(postApi => snakeToCamelCaseObject(postApi) as Post));
        setHasMore(postsApiResult.result.length >= offsetAmount);
        setOffset(postsApiResult.result.length);
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('該当ユーザの投稿の取得に失敗', error);
      }
    })();
  }, [apiGet, paramUserId, rawParamUserId]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={`/@${rawParamUserId}`} />;
  
  /** 続きを読み込む */
  const onFetchNextPosts = async () => {
    setIsNextLoading(true);
    try {
      const response = await apiGet(`/users/${paramUserId}/posts`, `?offset=${offset}&limit=${offsetAmount}`);  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApi.error != null) return console.error('ユーザ投稿の続きの読み込みに失敗', postsApi);
      
      const fetchedPosts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi) as Post);
      setPosts(previousPosts => [...previousPosts, ...fetchedPosts]);
      setHasMore(fetchedPosts.length >= offsetAmount);  // オフセット値以下の件数しか取れなかったら続きがないとみなす
      setOffset(previousOffset => previousOffset + fetchedPosts.length);  // 取得した投稿数を足す
    }
    catch(error) {
      console.error('ユーザ投稿の続きの読み込み処理に失敗', error);
    }
    finally {
      setIsNextLoading(false);
    }
  };
  
  const onFollow = async () => {
    
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>@{paramUserId}</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'not-found' && <Alert severity="error" sx={{ mt: 3 }}>指定のユーザ ID のユーザは存在しません</Alert>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>ユーザ情報の取得に失敗</Alert>}
    
    {status === 'succeeded' && <>
      <List sx={{ mt: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <ListItem><ListItemText primary="ユーザ ID" secondary={`@${user.id}`} /></ListItem>
        <Divider component="li" variant="middle" />
        <ListItem><ListItemText primary="ユーザ名" secondary={user.name} /></ListItem>
        <Divider component="li" variant="middle" />
        <ListItem><ListItemText primary="ロール" secondary={user.role} /></ListItem>
        <Divider component="li" variant="middle" />
        <ListItem><ListItemText primary="登録日" secondary={epochTimeMsToJstString(user.createdAt as string, 'YYYY-MM-DD')} /></ListItem>
      </List>
      
      {user.id !== userState.id &&
        <Typography component="p" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={onFollow}>フォローする</Button>
        </Typography>
      }
      
      <PostsListComponent propPosts={posts} />
      
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
        {hasMore
          ? <Button variant="contained" onClick={onFetchNextPosts} disabled={isNextLoading}>続きを読む</Button>
          : <Button variant="contained" disabled>フィードの終わり</Button>
        }
      </Typography>
    </>}
  </>;
};
