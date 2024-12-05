import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, Container, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { LogoutComponent } from '../../shared/components/LogoutComponent/LogoutComponent';
import { PostFormComponent } from '../../shared/components/PostFormComponent/PostFormComponent';
import { useApiGet } from '../../shared/hooks/use-api-fetch';
import { RootState } from '../../shared/stores/store';

import type { Result } from '../../common/types/result';
import type { Post, PostApi } from '../../common/types/post';

/** Global Timeline */
export const GlobalTimelinePage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  /** グローバルタイムラインを取得する */
  const fetchPosts = useCallback(async () => {
    setStatus('loading');
    setPosts([]);
    
    try {
      const response = await apiGet('/timeline/global');
      const postsApi: Result<Array<PostApi>> = await response.json();
      if(postsApi.error != null) return setStatus('failed');
      
      const posts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi));
      setPosts(posts);
      setStatus('succeeded');
    }
    catch(error) {
      setStatus('failed');
      console.error('グローバルタイムラインの取得に失敗しました', error);
    }
  }, [apiGet]);
  
  // 初回読み込み
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  // 再読み込み
  const onReload = () => fetchPosts();
  
  const epochTimeMsToJst = (epochTimeMs: string): string => {
    const date = new Date(Number(epochTimeMs) + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    const jst = date.getFullYear()
      + '-' + String(date.getMonth() + 1).padStart(2, '0')
      + '-' + String(date.getDate()).padStart(2, '0')
      + ' ' + String(date.getHours()).padStart(2, '0')
      + ':' + String(date.getMinutes()).padStart(2, '0')
      + ':' + String(date.getSeconds()).padStart(2, '0');
    return jst;
  };
  
  return (
    <Container maxWidth="sm">
      <Typography component="h1" variant="h4" marginY={2}>Global Timeline</Typography>
      <Typography component="p">
        ようこそ {userState.name} (@{userState.id}) さん
      </Typography>
      <PostFormComponent onAfterSubmit={onReload} />
      
      <Typography component="p" marginY={4}>現在、グローバルタイムラインは直近の50件を表示しています。</Typography>
      
      {status === 'loading' && <Typography component="p">Loading...</Typography>}
      
      {status !== 'loading' && <Typography component="p" marginY={3} sx={{ textAlign: 'right' }}>
        <Button variant="contained" onClick={onReload}>Reload</Button>
      </Typography>}
      
      {status === 'failed' && <Alert severity="error" sx={{ my: 3 }}>グローバルタイムラインの取得に失敗しました</Alert>}
      
      {status === 'succeeded' && posts.length === 0 && <Typography component="p" marginY={3}>投稿がありません</Typography>}
      
      {status === 'succeeded' && posts.length !== 0 && posts.map(post => (
        <Typography component="div" marginY={3} key={post.id} sx={{ lineHeight: 1.7 }}>
          <Typography component="p"><strong>@{post.userId}</strong><span style={{ fontSize: '.8rem', color: '#999' }}> - {epochTimeMsToJst(post.id)}</span></Typography>
          <Typography component="p" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{post.text}</Typography>
        </Typography>
      ))}
      
      <Box marginY={4} sx={{ textAlign: 'right' }}>
        <LogoutComponent />
      </Box>
    </Container>
  );
};
