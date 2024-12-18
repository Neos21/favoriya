import { FC, Fragment, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Alert, Avatar, Button, Divider, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../../shared/constants/user-constants';
import { useApiGet } from '../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../common/types/result';
import type { User, UserApi } from '../../../common/types/user';

/** Introductions Page */
export const IntroductionsPage: FC = () => {
  const { userId: rawParamUserId } = useParams<{ userId: string }>();
  
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [introductions, setIntroductions] = useState<Array<any>>([]);
  
  // 念のため `@` を除去するテイで作っておく
  const paramUserId = rawParamUserId.startsWith('@') ? rawParamUserId.slice(1) : rawParamUserId;
  
  // 初回読み込み
  useEffect(() => {
    setStatus('loading');
    if(!rawParamUserId.startsWith('@')) return;  // 先頭に `@` が付いていなかった場合は何もしない
    
    (async () => {
      try {
        const response = await apiGet(`/users/${paramUserId}/introductions`);  // Throws
        const introductionsApiResult: Result<Array<any>> = await response.json();  // Throws
        if(introductionsApiResult.error != null) return setStatus('failed');
        
        setIntroductions(introductionsApiResult.result.map(introductionApi => snakeToCamelCaseObject(introductionApi)) as Array<any>);
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('相互フォロワーからの紹介一覧の取得に失敗', error);
      }
    })();
  }, [apiGet, paramUserId, rawParamUserId]);
  
  // 先頭に `@` が付いていなかった場合は `@` 付きでリダイレクトさせる
  if(!rawParamUserId.startsWith('@')) return <Navigate to={`/@${rawParamUserId}/introductions`} />;
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>@{paramUserId} : 相互フォロワーからの紹介</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status !== 'loading' && <Typography component="p" sx={{ mt: 3 }}>
      <Button component={Link} to={`/@${paramUserId}`} variant="contained">戻る</Button>
    </Typography>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>相互フォロワーからの紹介一覧の取得に失敗</Alert>}
    
    {status === 'succeeded' && introductions.length === 0 && <Typography component="p" sx={{ mt: 3 }}>相互フォロワーからの紹介は存在しません</Typography>}
    
    {status === 'succeeded' && introductions.length > 0 && <>
      <List sx={{ mt: 3 }}>
        <Divider component="li" />
        {introductions.map(introduction => <Fragment key={introduction.id}>
          <ListItem alignItems="center" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar src={isEmptyString(introduction.avatarUrl) ? '' : `${userConstants.ossUrl}${introduction.avatarUrl}`} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Grid2 container spacing={1}>
                  <Grid2 size={6} sx={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    <Link to={`/@${introduction.id}`} className="hover-underline">{introduction.name}</Link>
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
    </>}
  </>;
};
