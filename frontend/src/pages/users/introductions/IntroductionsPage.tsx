import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Alert, Avatar, Button, Divider, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FollowRelationship, FollowRelationshipApi } from '../../../common/types/follow-relationship';
import { FontParserComponent } from '../../../shared/components/FontParserComponent/FontParserComponent';
import { LoadingSpinnerComponent } from '../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../../shared/constants/user-constants';
import { useApiDelete, useApiGet } from '../../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../../shared/services/convert-date-to-jst';
import { IntroductionFormComponent } from './components/IntroductionFormComponent/IntroductionFormComponent';
import { UnapprovedIntroductionsComponent } from './components/UnapprovedIntroductionsComponent/UnapprovedIntroductionsComponent';

import type { Result } from '../../../common/types/result';
import type { Introduction, IntroductionApi } from '../../../common/types/introduction';
import type { RootState } from '../../../shared/stores/store';

/** Introductions Page */
export const IntroductionsPage: FC = () => {
  const { userId: rawParamUserId } = useParams<{ userId: string }>();
  
  const userState = useSelector((state: RootState) => state.user);
  
  const apiGet = useApiGet();
  const apiDelete = useApiDelete();
  
  // 承認済みの紹介一覧を表示する
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [approvedIntroductions, setApprovedIntroductions] = useState<Array<Introduction>>([]);
  // 相互フォロワーの相手に紹介文を書ける (Actor になれる) 状態か否か
  const [isActor, setIsActor] = useState<boolean>(false);
  
  // 念のため `@` を除去するテイで作っておく
  const paramUserId = rawParamUserId.startsWith('@') ? rawParamUserId.slice(1) : rawParamUserId;
  
  /** 承認済み紹介一覧を読み込む */
  const onLoadIntroductions = useCallback(async () => {
    try {
      const response = await apiGet(`/users/${paramUserId}/introductions`);  // Throws
      const introductionsApiResult: Result<Array<IntroductionApi>> = await response.json();  // Throws
      if(introductionsApiResult.error != null) return setStatus('failed');
      
      setApprovedIntroductions(introductionsApiResult.result.map(introductionApi => snakeToCamelCaseObject(introductionApi)) as Array<Introduction>);
      setStatus('succeeded');
    }
    catch(error) {
      setStatus('failed');
      return console.error('相互フォロワーからの紹介一覧の取得に失敗', error);
    }
  }, [apiGet, paramUserId]);
  
  // 初回読込
  useEffect(() => {
    setStatus('loading');
    if(!rawParamUserId.startsWith('@')) return;  // 先頭に `@` が付いていなかった場合は何もしない
    
    (async () => {
      // 承認済み紹介一覧を取得する
      await onLoadIntroductions();
      
      // ログインユーザがこのページのユーザと相互フォローなら投稿欄を表示する
      if(userState.id !== paramUserId) {
        try {
          const relationshipResponse = await apiGet(`/users/${paramUserId}/followers/${userState.id}`);  // Throws
          const relationshipResult: Result<FollowRelationshipApi> = await relationshipResponse.json();  // Throws
          const followRelationship: FollowRelationship = snakeToCamelCaseObject(relationshipResult.result) as FollowRelationship;
          
          setIsActor(followRelationship.followingToFollower != null && followRelationship.followerToFollowing != null);  // 相互フォロー状態なら投稿欄を表示する
        }
        catch(error) {
          return console.error('ユーザのフォロー情報の取得に失敗', error);
        }
      }
    })();
  }, [apiGet, onLoadIntroductions, paramUserId, rawParamUserId, userState.id]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={`/@${rawParamUserId}/introductions`} />;
  
  /** 被紹介者本人 : 紹介文を削除する */
  const onDelete = async (actorUserId: string) => {
    try {
      await apiDelete(`/users/${userState.id}/introductions/${actorUserId}`, `?operator_user_id=${paramUserId}`);
      onLoadIntroductions();
    }
    catch(error) {
      console.error('紹介文の削除処理に失敗', error);
    }
  };
  
  /** 承認済みの紹介者本人 : 紹介文を削除する */
  const onCancel = async () => {
    try {
      await apiDelete(`/users/${paramUserId}/introductions/${userState.id}`, `?operator_user_id=${userState.id}`);
      onLoadIntroductions();
    }
    catch(error) {
      console.error('紹介文の取下処理に失敗', error);
    }
  };
  
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>@{paramUserId} : 相互フォロワーからの紹介</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status !== 'loading' && <Typography component="p" sx={{ mt: 3 }}>
      <Button component={Link} to={`/@${paramUserId}`} variant="contained">戻る</Button>
    </Typography>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>相互フォロワーからの紹介一覧の取得に失敗</Alert>}
    
    {status === 'succeeded' && approvedIntroductions.length === 0 && <Typography component="p" sx={{ mt: 3 }}>相互フォロワーからの紹介はありません</Typography>}
    
    {status === 'succeeded' && approvedIntroductions.length > 0 &&
      <List sx={{ mt: 3 }}>
        <Divider component="li" />
        {approvedIntroductions.map(introduction => <Fragment key={introduction.id}>
          <ListItem alignItems="center" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar src={isEmptyString(introduction.actorUser.avatarUrl) ? '' : `${userConstants.ossUrl}${introduction.actorUser.avatarUrl}`} />
            </ListItemAvatar>
            <ListItemText
              primary={<>
                <Grid2 container spacing={1}>
                  <Grid2 size="grow" sx={{ color: 'grey.600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    <Typography component={Link} to={`/@${introduction.actorUser.id}`} className="hover-underline" sx={{ mr: 1, color: 'text.primary', fontWeight: 'bold' }}>{introduction.actorUser.name}</Typography>
                    <Typography component="span">@{introduction.actorUser.id}</Typography>
                  </Grid2>
                  <Grid2 sx={{ color: 'grey.600', fontSize: '.8rem' }}>
                    {epochTimeMsToJstString(introduction.updatedAt as string, 'YYYY-MM-DD HH:mm:SS')}
                  </Grid2>
                </Grid2>
                <Grid2 container spacing={1} sx={{ mt: 1 }}>
                  <Grid2 size="grow" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    <FontParserComponent input={introduction.text} />
                  </Grid2>
                  {userState.id === paramUserId &&
                    // 被紹介者が自分のページを見ている時 : 承認した紹介文を削除できる
                    <Grid2>
                      <Button variant="contained" color="error" onClick={() => onDelete(introduction.actorUserId)}>削除</Button>
                    </Grid2>
                  }
                  {userState.id === introduction.actorUserId &&
                    // 紹介者自身が自分の承認された紹介文を見ている時 : 紹介文の更新ではなく取り下げが可能
                    <Grid2>
                      <Button variant="contained" color="error" onClick={onCancel}>取下</Button>
                    </Grid2>
                  }
                </Grid2>
              </>}
            />
          </ListItem>
          <Divider component="li" />
        </Fragment>)}
      </List>
    }
    
    {userState.id === paramUserId && <>
      <Divider sx={{ mt: 4 }} />
      <UnapprovedIntroductionsComponent recipientUserId={paramUserId} onAfterApproved={onLoadIntroductions} />
    </>}
    
    {isActor && <>
      <Divider sx={{ mt: 4 }} />
      <IntroductionFormComponent recipientUserId={paramUserId} actorUserId={userState.id} onAfterPost={onLoadIntroductions} />
    </>}
  </>;
};
