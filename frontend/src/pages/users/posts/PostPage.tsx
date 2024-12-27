import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Alert, Box, Button, Grid2, Modal, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostFormComponent } from '../../../shared/components/PostFormComponent/PostFormComponent';
import { PostsListComponent } from '../../../shared/components/PostsListComponent/PostsListComponent';
import { httpStatusConstants } from '../../../shared/constants/http-status-constants';
import { modalStyleConstants } from '../../../shared/constants/modal-style-constants';
import { useApiDelete, useApiGet, useApiPost } from '../../../shared/hooks/use-api-fetch';
import { AfterRepliesComponent } from './components/AfterRepliesComponent';

import type { RootState } from '../../../shared/stores/store';
import type { Post, PostApi } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

/** Post Page */
export const PostPage: FC = () => {
  const { userId: rawParamUserId, postId: paramPostId } = useParams<{ userId: string, postId: string }>();
  
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  const apiPost = useApiPost();
  const apiDelete = useApiDelete();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'not-found' | 'failed'>('loading');
  const [post, setPost] = useState<Post>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<boolean>(false);
  
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
  
  /** リプライする */
  const onSubmit = async (newPostApi: PostApi) => {
    const response = await apiPost(`/users/${paramUserId}/posts/${paramPostId}/replies`, newPostApi);  // Throws
    if(!response.ok) {
      const responseResult: Result<null> = await response.json();  // Throws
      throw new Error(responseResult.error ?? 'リプライ時にエラーが発生しました');
    }
    
    setReloadTrigger(previoursReloadTrigger => !previoursReloadTrigger);  // フラグ変数を入れ替えることで子コンポーネントの読込処理を実行させる
  };
  
  // 初回読込
  useEffect(() => {
    setStatus('loading');
    if(!rawParamUserId.startsWith('@')) return;  // 先頭に `@` が付いていなかった場合は何もしない
    (async () => {
      try {
        const response = await apiGet(`/users/${paramUserId}/posts/${paramPostId}`);  // Throws
        const postApiResult: Result<PostApi> = await response.json();  // Throws
        if(postApiResult.error != null) return setStatus(response.status === httpStatusConstants.notFound ? 'not-found' : 'failed');
        
        setPost(snakeToCamelCaseObject(postApiResult.result) as Post);
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('投稿の取得に失敗', error);
      }
    })();
  }, [apiGet, paramUserId, rawParamUserId, paramPostId]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={`/@${rawParamUserId}/posts/${paramPostId}`} />;
  
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>@{paramUserId}</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'not-found' && <Alert severity="error" sx={{ mt: 3 }}>指定の投稿は存在しません</Alert>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>投稿の取得に失敗</Alert>}
    
    {status === 'succeeded' && <>
      <PostsListComponent propPosts={[post]} />
      
      {(userState.id === post.userId || userState.role === 'Admin') &&
        <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="error" onClick={onConfirmDelete}>削除</Button>
        </Box>
      }
      
      <AfterRepliesComponent inReplyToPostId={paramPostId} inReplyToUserId={paramUserId} reloadTrigger={reloadTrigger} />
      
      <PostFormComponent onSubmit={onSubmit} inReplyToPostId={paramPostId} inReplyToUserId={paramUserId} />
      
      <Modal open={isModalOpen} onClose={onCancelConfirm}>
        <Box component="div" sx={modalStyleConstants}>
          <Typography component="h2">本当に削除しますか？</Typography>
          <Grid2 container spacing={3} sx={{ mt: 3 }}>
            <Grid2 size={6}><Button variant="contained" onClick={onCancelConfirm}>キャンセル</Button></Grid2>
            <Grid2 size={6} sx={{ textAlign: 'right' }}><Button variant="contained" color="error" onClick={onDelete}>削除する</Button></Grid2>
          </Grid2>
        </Box>
      </Modal>
    </>}
  </>;
};
