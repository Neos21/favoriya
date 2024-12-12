import { FC, useCallback, useEffect, useState } from 'react';

import { Alert, Button, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostFormComponent } from '../../shared/components/PostFormComponent/PostFormComponent';
import { PostsListComponent } from '../../shared/components/PostsListComponent/PostsListComponent';
import { useApiGet } from '../../shared/hooks/use-api-fetch';

import type { Post, PostApi } from '../../common/types/post';
import type { Result } from '../../common/types/result';

/** Global Timeline Page */
export const GlobalTimelinePage: FC = () => {
  const offsetAmount = 100;  // 100件ずつ読み込む
  
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isNextLoading, setIsNextLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  /** 最初のグローバルタイムラインを取得する */
  const fetchFirstPosts = useCallback(async () => {
    setStatus('loading');
    setPosts([]);
    try {
      const response = await apiGet('/timeline/global', `?offset=0&limit=${offsetAmount}`);  // Throws
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
      console.error('グローバルタイムラインの取得に失敗', error);
    }
  }, [apiGet]);
  
  // 初回読み込み
  useEffect(() => {
    fetchFirstPosts();
  }, [fetchFirstPosts]);
  
  /** 再読み込み */
  const onReload = () => fetchFirstPosts();
  
  /** 続きを読み込む */
  const onFetchNextPosts = async () => {
    setIsNextLoading(true);
    try {
      const response = await apiGet('/timeline/global', `?offset=${offset}&limit=${offsetAmount}`);  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApi.error != null) return console.error('グローバルタイムラインの続きの読み込みに失敗', postsApi);
      
      const fetchedPosts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi) as Post);
      setPosts(previousPosts => [...previousPosts, ...fetchedPosts]);
      setHasMore(fetchedPosts.length >= offsetAmount);  // オフセット値以下の件数しか取れなかったら続きがないとみなす
      setOffset(previousOffset => previousOffset + fetchedPosts.length);  // 取得した投稿数を足す
    }
    catch(error) {
      console.error('グローバルタイムラインの続きの読み込み処理に失敗', error);
    }
    finally {
      setIsNextLoading(false);
    }
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>グローバルタイムライン</Typography>
    
    <PostFormComponent onAfterSubmit={onReload} />
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status !== 'loading' &&
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
        <Button variant="contained" onClick={onReload}>再読込</Button>
      </Typography>
    }
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>グローバルタイムラインの取得に失敗</Alert>}
    
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
