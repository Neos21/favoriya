import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Alert, Button, Divider, Grid2, List, ListItem, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostsListComponent } from '../../shared/components/PostsListComponent/PostsListComponent';
import { httpStatus } from '../../shared/constants/http-status';
import { useApiDelete, useApiGet, useApiPost } from '../../shared/hooks/use-api-fetch';
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
  const apiPost = useApiPost();
  const apiDelete = useApiDelete();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'not-found' | 'failed'>('loading');
  
  const [user, setUser] = useState<User>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);  // ログインユーザが表示対象ユーザをフォローしているか否か
  
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
      // ユーザ情報を取得する
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
      
      // 自分自身でなければフォロー or アンフォローボタンを表示する
      if(paramUserId !== userState.id) {
        try {
          const response = await apiGet(`/users/${paramUserId}/followers/${userState.id}`);  // Throws
          if(response.status === httpStatus.ok) {
            setIsFollowing(true);  // フォロー情報が返ってきたらフォロー中
          }
          else if(response.status === httpStatus.notFound) {
            setIsFollowing(false);  // 404 ならフォローしていない
          }
          else {
            return setStatus('failed');  // それ以外のステータスコードの場合はエラー
          }
        }
        catch(error) {
          setStatus('failed');
          return console.error('ユーザのフォロー情報の取得に失敗', error);
        }
      }
      
      // 投稿を取得する
      try {
        const response = await apiGet(`/users/${paramUserId}/posts`, `?offset=0&limit=${offsetAmount}`);  // Throws
        const postsApiResult: Result<Array<PostApi>> = await response.json();  // Throws
        if(postsApiResult.error != null) return setStatus('failed');
        
        setPosts(postsApiResult.result.map(postApi => snakeToCamelCaseObject(postApi) as Post));
        setHasMore(postsApiResult.result.length >= offsetAmount);
        setOffset(postsApiResult.result.length);
      }
      catch(error) {
        setStatus('failed');
        return console.error('該当ユーザの投稿の取得に失敗', error);
      }
      
      setStatus('succeeded');
    })();
  }, [apiGet, paramUserId, rawParamUserId, userState.id]);
  
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
  
  /** フォローする */
  const onFollow = async () => {
    try {
      const response = await apiPost(`/users/${paramUserId}/followers`, { following_user_id: userState.id });
      if(response.status !== httpStatus.created) throw new Error(String(response.status));
      setIsFollowing(true);
    }
    catch(error) {
      console.error('フォロー処理に失敗', error);
    }
  };
  
  /** フォロー解除する */
  const onUnfollow = async () => {
    try {
      const response = await apiDelete(`/users/${paramUserId}/followers`, `?following_user_id=${userState.id}`);
      if(response.status !== httpStatus.noContent) throw new Error(String(response.status));
      setIsFollowing(false);
    }
    catch(error) {
      console.error('フォロー解除処理に失敗', error);
    }
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
      
      <Grid2 container spacing={1} sx={{ mt: 3 }}>
        <Grid2 size={6}><Link to={`/@${user.id}/followings`} className="hover-underline">フォロー中一覧</Link></Grid2>
        <Grid2 size={6} sx={{ textAlign: 'right' }}><Link to={`/@${user.id}/followers`} className="hover-underline">フォロワー一覧</Link></Grid2>
      </Grid2>
      
      {user.id !== userState.id &&
        <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
          {!isFollowing && <Button variant="contained" onClick={onFollow}>フォローする</Button>}
          { isFollowing && <Button variant="contained" onClick={onUnfollow}>フォロー解除する</Button>}
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
