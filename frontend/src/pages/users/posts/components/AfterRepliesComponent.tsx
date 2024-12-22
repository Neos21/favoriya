import { FC, useCallback, useEffect, useState } from 'react';

import { Alert, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostsListComponent } from '../../../../shared/components/PostsListComponent/PostsListComponent';
import { useApiGet } from '../../../../shared/hooks/use-api-fetch';

import type { Post, PostApi } from '../../../../common/types/post';
import type { Result } from '../../../../common/types/result';

type Props ={
  inReplyToPostId: string,
  inReplyToUserId: string,
  reloadTrigger  : boolean  // boolean の変化自体でリロードがかかる
};

/** After Replies Component */
export const AfterRepliesComponent: FC<Props> = ({ inReplyToPostId, inReplyToUserId, reloadTrigger }) => {
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  const onLoadPosts = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await apiGet(`/users/${inReplyToUserId}/posts/${inReplyToPostId}/replies`);  // Throws
      const postsApiResult: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApiResult.error != null) return setStatus('failed');
      
      setPosts(postsApiResult.result.map(postApi => snakeToCamelCaseObject(postApi) as Post));
      setStatus('succeeded');
    }
    catch(error) {
      setStatus('failed');
      return console.error('リプライ一覧の取得に失敗', error);
    }
  }, [apiGet, inReplyToPostId, inReplyToUserId]);
  
  // 初回読み込み・リロード
  useEffect(() => {
    onLoadPosts();
  }, [onLoadPosts, reloadTrigger]);
  
  return <>
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'failed' && <>
      <Typography component="h2" variant="h5" sx={{ mt: 3 }}>リプライ一覧</Typography>
      <Alert severity="error" sx={{ mt: 3 }}>リプライ一覧の取得に失敗</Alert>
    </>}
    
    {status === 'succeeded' && posts.length > 0 && <>
      <Typography component="h2" variant="h5" sx={{ mt: 3 }}>リプライ一覧</Typography>
      <PostsListComponent propPosts={posts} />
    </>}
  </>;
};
