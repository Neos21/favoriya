import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Alert, Box, Button, Grid2, Modal, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostsListComponent } from '../../../shared/components/PostsListComponent/PostsListComponent';
import { httpStatus } from '../../../shared/constants/http-status';
import { modalStyle } from '../../../shared/constants/modal-style';
import { useApiDelete, useApiGet } from '../../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../../shared/services/convert-date-to-jst';

import type { RootState } from '../../../shared/stores/store';
import type { Post, PostApi } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

/** Post Page */
export const PostPage: FC = () => {
  const { userId: rawParamUserId, postId: paramPostId } = useParams<{ userId: string, postId: string }>();
  
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  const apiDelete = useApiDelete();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'not-found' | 'failed'>('loading');
  const [post, setPost] = useState<Post>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // 念のため `@` を除去するテイで作っておく
  const paramUserId = rawParamUserId.startsWith('@') ? rawParamUserId.slice(1) : rawParamUserId;
  
  /** 削除確認ダイアログを開く */
  const onConfirmDelete = () => setIsModalOpen(true);
  /** 削除確認ダイアログを閉じる */
  const onCancelConfirm = () => setIsModalOpen(false);
  /** 削除する */
  const onDelete = async () => {
    try {
      await apiDelete(`/users/${paramUserId}/posts/${paramPostId}`);
    }
    catch(error) {
      console.error('投稿の削除処理に失敗', error);
    }
    finally {
      navigate(`/@${paramUserId}`);  // ユーザページに遷移する
    }
  };
  
  // 初回読み込み
  useEffect(() => {
    setStatus('loading');
    if(!rawParamUserId.startsWith('@')) return;  // 先頭に `@` が付いていなかった場合は何もしない
    (async () => {
      try {
        const response = await apiGet(`/users/${paramUserId}/posts/${paramPostId}`);  // Throws
        const postApiResult: Result<PostApi> = await response.json();  // Throws
        if(postApiResult.error != null) return setStatus(response.status === httpStatus.notFound ? 'not-found' : 'failed');
        
        setPost(snakeToCamelCaseObject(postApiResult.result) as Post);
      }
      catch(error) {
        setStatus('failed');
        return console.error('投稿の取得に失敗', error);
      }
      
      setStatus('succeeded');
    })();
  }, [apiGet, paramUserId, rawParamUserId, paramPostId]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={`/@${rawParamUserId}/posts/${paramPostId}`} />;
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>
      @{paramUserId}
      {status === 'succeeded' && <>
        <Typography component="span" variant="h4" sx={{ mx: 1 }}>:</Typography>
        {epochTimeMsToJstString(post.id, 'YYYY-MM-DD HH:mm:SS')}
      </>}
    </Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'not-found' && <Alert severity="error" sx={{ mt: 3 }}>指定の投稿は存在しません</Alert>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>投稿の取得に失敗</Alert>}
    
    {status === 'succeeded' && <>
      <PostsListComponent propPosts={[post]} />
      
      {userState.id === post.userId &&
        <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="error" onClick={onConfirmDelete}>削除</Button>
        </Box>
      }
      
      <Modal open={isModalOpen}>
        <Box component="div" sx={modalStyle}>
          <Typography component="h2" variant="h5">本当に削除しますか？</Typography>
          <Grid2 container spacing={3} sx={{ mt: 3 }}>
            <Grid2 size={6}><Button variant="contained" onClick={onCancelConfirm}>キャンセル</Button></Grid2>
            <Grid2 size={6} sx={{ textAlign: 'right' }}><Button variant="contained" color="error" onClick={onDelete}>削除する</Button></Grid2>
          </Grid2>
        </Box>
      </Modal>
    </>}
  </>;
};
