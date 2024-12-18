import { FC, Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Alert, Avatar, Button, Divider, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FollowRelationship, FollowRelationshipApi } from '../../../common/types/follow-relationship';
import { LoadingSpinnerComponent } from '../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../../shared/constants/user-constants';
import { useApiGet } from '../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../common/types/result';
import type { Introduction, IntroductionApi } from '../../../common/types/introduction';
import type { RootState } from '../../../shared/stores/store';
/** Introductions Page */
export const IntroductionsPage: FC = () => {
  const { userId: rawParamUserId } = useParams<{ userId: string }>();
  
  const userState = useSelector((state: RootState) => state.user);
  
  const apiGet = useApiGet();
  
  // 承認済みの紹介一覧を表示する
  const [approvedIntroductionsStatus, setApprovedIntroductionsStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [approvedIntroductions, setApprovedIntroductions] = useState<Array<Introduction>>([]);
  // ログインユーザ自身のページを開いている時、未承認の一覧を表示する
  const [unapprovedIntroductionsStatus, setUnapprovedIntroductionsStatus] = useState<'none' | 'loading' | 'succeeded' | 'failed'>('none');
  const [unapprovedIntroductions, setUnapprovedIntroductions] = useState<Array<Introduction>>([]);
  // 相互フォロワーの相手に紹介文を書ける (Actor になれる) 状態か否か
  const [isActor, setIsActor] = useState<boolean>(false);
  
  // 念のため `@` を除去するテイで作っておく
  const paramUserId = rawParamUserId.startsWith('@') ? rawParamUserId.slice(1) : rawParamUserId;
  
  // 初回読み込み
  useEffect(() => {
    setApprovedIntroductionsStatus('loading');
    if(!rawParamUserId.startsWith('@')) return;  // 先頭に `@` が付いていなかった場合は何もしない
    
    (async () => {
      // 承認済み紹介一覧を取得する
      try {
        const response = await apiGet(`/users/${paramUserId}/introductions`);  // Throws
        const introductionsApiResult: Result<Array<IntroductionApi>> = await response.json();  // Throws
        if(introductionsApiResult.error != null) return setApprovedIntroductionsStatus('failed');
        
        setApprovedIntroductions(introductionsApiResult.result.map(introductionApi => snakeToCamelCaseObject(introductionApi)) as Array<Introduction>);
        setApprovedIntroductionsStatus('succeeded');
      }
      catch(error) {
        setApprovedIntroductionsStatus('failed');
        return console.error('相互フォロワーからの紹介一覧の取得に失敗', error);
      }
      
      // ログインユーザ本人のページなら未承認紹介一覧も表示する
      if(userState.id === paramUserId) {
        try {
          const response = await apiGet(`/users/${paramUserId}/introductions/unapproved`);  // Throws
          const introductionsApiResult: Result<Array<IntroductionApi>> = await response.json();  // Throws
          if(introductionsApiResult.error != null) return setUnapprovedIntroductionsStatus('failed');
          
          setUnapprovedIntroductions(introductionsApiResult.result.map(introductionApi => snakeToCamelCaseObject(introductionApi)) as Array<Introduction>);
          setUnapprovedIntroductionsStatus('succeeded');
        }
        catch(error) {
          setUnapprovedIntroductionsStatus('failed');
          return console.error('未承認の紹介一覧の取得に失敗', error);
        }
      }
      
      // ログインユーザがこのページのユーザと相互フォローなら投稿欄を表示する
      if(userState.id !== paramUserId) {
        try {
          const response = await apiGet(`/users/${paramUserId}/followers/${userState.id}`);  // Throws
          const result: Result<FollowRelationshipApi> = await response.json();  // Throws
          const followRelationship: FollowRelationship = snakeToCamelCaseObject(result.result) as FollowRelationship;
          setIsActor(followRelationship.followingToFollower != null && followRelationship.followerToFollowing != null);  // 相互フォロー状態なら投稿欄を表示する
        }
        catch(error) {
          return console.error('ユーザのフォロー情報の取得に失敗', error);
        }
      }
    })();
  }, [apiGet, paramUserId, rawParamUserId, userState.id]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={`/@${rawParamUserId}/introductions`} />;
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>@{paramUserId} : 相互フォロワーからの紹介</Typography>
    
    {approvedIntroductionsStatus === 'loading' && <LoadingSpinnerComponent />}
    
    {approvedIntroductionsStatus !== 'loading' && <Typography component="p" sx={{ mt: 3 }}>
      <Button component={Link} to={`/@${paramUserId}`} variant="contained">戻る</Button>
    </Typography>}
    
    {approvedIntroductionsStatus === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>相互フォロワーからの紹介一覧の取得に失敗</Alert>}
    {approvedIntroductionsStatus === 'succeeded' && approvedIntroductions.length === 0 && <Typography component="p" sx={{ mt: 3 }}>相互フォロワーからの紹介はありません</Typography>}
    {approvedIntroductionsStatus === 'succeeded' && approvedIntroductions.length > 0 &&
      <List sx={{ mt: 3 }}>
        <Divider component="li" />
        {approvedIntroductions.map(introduction => <Fragment key={introduction.id}>
          <ListItem alignItems="center" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar src={isEmptyString(introduction?.avatarUrl) ? '' : `${userConstants.ossUrl}${introduction?.avatarUrl}`} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Grid2 container spacing={1}>
                  <Grid2 size={6} sx={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    <Link to={`/@${introduction.id}`} className="hover-underline">{introduction?.name}</Link>
                  </Grid2>
                  <Grid2 size={6} sx={{ color: 'grey.600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    @{introduction.id}
                  </Grid2>
                </Grid2>
              }
            />
          </ListItem>
          <Divider component="li" />
        </Fragment>)}
      </List>
    }
    
    {unapprovedIntroductionsStatus !== 'none' && <>
      <Divider sx={{ mt: 4 }} />
      <Typography component="h2" variant="h5" sx={{ mt: 3 }}>承認待ちの紹介一覧</Typography>
    </>}
    {unapprovedIntroductionsStatus === 'loading' && <LoadingSpinnerComponent />}
    {unapprovedIntroductionsStatus === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>承認待ちの紹介一覧の取得に失敗</Alert>}
    {unapprovedIntroductionsStatus === 'succeeded' && unapprovedIntroductions.length === 0 && <Typography component="p" sx={{ mt: 3 }}>承認待ちの紹介はありません</Typography>}
    {unapprovedIntroductionsStatus === 'succeeded' && unapprovedIntroductions.length > 0 && <Typography>TODO</Typography>}
    
    {isActor && <>
      <Divider sx={{ mt: 4 }} />
      <Typography component="h2" variant="h5" sx={{ mt: 3 }}>紹介文を書く</Typography>
    </>}
  </>;
};
