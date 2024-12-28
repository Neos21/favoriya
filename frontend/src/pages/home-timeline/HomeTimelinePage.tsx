import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Button, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostFormComponent } from '../../shared/components/PostFormComponent/PostFormComponent';
import { PostsListComponent } from '../../shared/components/PostsListComponent/PostsListComponent';
import { useApiGet, useApiPost } from '../../shared/hooks/use-api-fetch';

import type { Post, PostApi } from '../../common/types/post';
import type { Result } from '../../common/types/result';
import type { RootState } from '../../shared/stores/store';

/** Home Timeline Page */
export const HomeTimelinePage: FC = () => {
  /** 1回につき読み込む件数 */
  const offsetAmount = 50;
  
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  const apiPost = useApiPost();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isNextLoading, setIsNextLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  /** 最初のホームタイムラインを取得する */
  const fetchFirstPosts = useCallback(async () => {
    setStatus('loading');
    setPosts([]);
    try {
      const response = await apiGet('/timeline/home', `?user_id=${userState.id}&offset=0&limit=${offsetAmount}`);  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApi.error != null) return setStatus('failed');
      
      const fetchedPosts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi) as Post);
      setPosts(fetchedPosts);
      setHasMore(fetchedPosts.length >= offsetAmount);  // オフセット値以下の件数しか取れなかったら続きがないとみなす
      setOffset(fetchedPosts.length);  // 最初のオフセット値は取得した投稿数にする
      setStatus('succeeded');
    }
    catch(error) {
      setStatus('failed');
      console.error('ホームタイムラインの取得に失敗', error);
    }
  }, [apiGet, userState.id]);
  
  // 初回読込
  useEffect(() => {
    fetchFirstPosts();
  }, [fetchFirstPosts]);
  
  /** 投稿 */
  const onSubmit = async (newPostApi: PostApi) => {
    const response = await apiPost(`/users/${userState.id}/posts`, newPostApi);  // Throws
    if(!response.ok) {
      const responseResult: Result<null> = await response.json();  // Throws
      throw new Error(responseResult.error ?? '投稿時にエラーが発生しました');
    }
    
    await fetchFirstPosts();  // 再読込
  };
  
  /** 再読込 */
  const onReload = () => fetchFirstPosts();
  
  /** 続きを読み込む */
  const onFetchNextPosts = async () => {
    setIsNextLoading(true);
    try {
      const response = await apiGet('/timeline/home', `?user_id=${userState.id}&offset=${offset}&limit=${offsetAmount}`);  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApi.error != null) return console.error('ホームタイムラインの続きの読込に失敗', postsApi);
      
      const fetchedPosts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi) as Post);
      setPosts(previousPosts => [...previousPosts, ...fetchedPosts]);
      setHasMore(fetchedPosts.length >= offsetAmount);  // オフセット値以下の件数しか取れなかったら続きがないとみなす
      setOffset(previousOffset => previousOffset + fetchedPosts.length);  // 取得した投稿数を足す
    }
    catch(error) {
      console.error('ホームタイムラインの続きの読込処理に失敗', error);
    }
    finally {
      setIsNextLoading(false);
    }
  };
  
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>ホーム</Typography>
    
    <PostFormComponent onSubmit={onSubmit} />
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status !== 'loading' &&
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
        <Button variant="contained" onClick={onReload}>再読込</Button>
      </Typography>
    }
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>ホームタイムラインの取得に失敗</Alert>}
    
    {status === 'succeeded' && <>
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
