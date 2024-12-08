import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Button, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { FontParserComponent } from '../../shared/components/FontParserComponent/FontParserComponent';
import { PostFormComponent } from '../../shared/components/PostFormComponent/PostFormComponent';
import { useApiGet } from '../../shared/hooks/use-api-fetch';

import type { Post, PostApi } from '../../common/types/post';
import type { Result } from '../../common/types/result';
import type { RootState } from '../../shared/stores/store';

/** Global Timeline Page */
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
      const response = await apiGet('/timeline/global');  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
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
  
  return (<>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>グローバルタイムライン</Typography>
    <Typography component="p" sx={{ mt: 3 }}>
      ようこそ {userState.name} (@{userState.id}) さん
    </Typography>
    
    <PostFormComponent onAfterSubmit={onReload} />
    
    <Typography component="p" sx={{ mt: 3 }}>現在、グローバルタイムラインは直近の50件を表示しています。</Typography>
    
    {status === 'loading' && <></>}  {/* TODO : スピナー */}
    
    {status !== 'loading' && <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" onClick={onReload}>Reload</Button>
    </Typography>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>グローバルタイムラインの取得に失敗しました</Alert>}
    
    {status === 'succeeded' && posts.length === 0 && <Typography component="p" sx={{ mt: 3 }}>投稿がありません</Typography>}
    
    {status === 'succeeded' && posts.length !== 0 && <List sx={{ mt: 3 }}>
      {posts.map(post => (<>
        <ListItem alignItems="flex-start" key={post.id} sx={{ wordBreak: 'break-all', px: 0 }}>
          <ListItemText
            primary={
              <Typography component="p">
                <Typography component="strong" sx={{ mr: 1, fontWeight: 'bold' }}>{post.user.name}</Typography>
                <Typography component="span" sx={{ color: '#999' }}>
                  @{post.userId}
                  <Typography component="span" sx={{ fontSize: '.8rem' }}> - {epochTimeMsToJst(post.id)}</Typography>
                </Typography>
              </Typography>
            }
            secondary={
              <Typography component="div" sx={{ mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                <FontParserComponent input={post.text} />
              </Typography>
            }
          />
        </ListItem>
        <Divider component="li" />
      </>))}
    </List>}
  </>);
};
