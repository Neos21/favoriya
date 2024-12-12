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
  const apiGet = useApiGet();
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  /** グローバルタイムラインを取得する */
  const fetchPosts = useCallback(async () => {
    setStatus('loading');
    setPosts([]);
    
    try {
      const response = await apiGet('/timeline/global');  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApi.error != null) return setStatus('failed');
      
      const posts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi) as Post);
      setPosts(posts);
      setStatus('succeeded');
    }
    catch(error) {
      setStatus('failed');
      console.error('グローバルタイムラインの取得に失敗', error);
    }
  }, [apiGet]);
  
  // 初回読み込み
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  // 再読み込み
  const onReload = () => fetchPosts();
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>グローバルタイムライン</Typography>
    
    <PostFormComponent onAfterSubmit={onReload} />
    
    <Typography component="p" sx={{ mt: 3 }}>現在、グローバルタイムラインは直近の50件を表示しています。</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status !== 'loading' &&
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
        <Button variant="contained" onClick={onReload}>再読込</Button>
      </Typography>
    }
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>グローバルタイムラインの取得に失敗</Alert>}
    
    {status === 'succeeded' && <PostsListComponent propPosts={posts} />}
  </>;
};
