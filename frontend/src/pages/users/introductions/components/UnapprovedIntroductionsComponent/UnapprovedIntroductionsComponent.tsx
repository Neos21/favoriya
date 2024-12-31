import { FC, Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert, Avatar, Button, Divider, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../../../common/helpers/convert-case';
import { isEmptyString } from '../../../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../../../../shared/components/FontParserComponent/FontParserComponent';
import { LoadingSpinnerComponent } from '../../../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../../../../shared/constants/user-constants';
import { useApiDelete, useApiGet, useApiPatch } from '../../../../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../../../../shared/services/convert-date-to-jst';

import type { Result } from '../../../../../common/types/result';
import type { Introduction, IntroductionApi } from '../../../../../common/types/introduction';

type Props = {
  /** 紹介される側 (ログインユーザ) */
  recipientUserId: string,
  /** 承認後に親コンポーネントで行う処理 (承認済一覧の再読込) */
  onAfterApproved: () => void
};

/** Unapproved Introductions Component */
export const UnapprovedIntroductionsComponent: FC<Props> = ({ recipientUserId, onAfterApproved }) => {
  const apiGet = useApiGet();
  const apiPatch = useApiPatch();
  const apiDelete = useApiDelete();
  
  // ログインユーザ自身のページを開いている時、未承認の一覧を表示する
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [unapprovedIntroductions, setUnapprovedIntroductions] = useState<Array<Introduction>>([]);
  
  // 初回読込
  useEffect(() => {
    setStatus('loading');
    (async () => {
      // 未承認紹介一覧を取得・表示する
      try {
        const response = await apiGet(`/users/${recipientUserId}/introductions/unapproved`);  // Throws
        const introductionsApiResult: Result<Array<IntroductionApi>> = await response.json();  // Throws
        if(introductionsApiResult.error != null) return setStatus('failed');
        
        setUnapprovedIntroductions(introductionsApiResult.result.map((introductionApi: IntroductionApi) => snakeToCamelCaseObject(introductionApi)) as Array<Introduction>);
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('未承認の紹介一覧の取得に失敗', error);
      }
    })();
  }, [apiGet, recipientUserId]);
  
  /** 承認する */
  const onApprove = async (actorUserId: string) => {
    try{
      await apiPatch(`/users/${recipientUserId}/introductions/${actorUserId}/approve`, {});  // Throws
      // 承認したモノを一覧から削除する
      setUnapprovedIntroductions(unapprovedIntroductions.filter(introduction => introduction.actorUserId !== actorUserId));
      // 承認済み一覧を再読込させる
      onAfterApproved();
    }
    catch(error) {
      console.error('承認処理に失敗', error);
    }
  };
  
  /** 却下する */
  const onUnapprove = async (actorUserId: string) => {
    try {
      await apiDelete(`/users/${recipientUserId}/introductions/${actorUserId}`, `?operator_user_id=${recipientUserId}`);
      // 却下したモノを一覧から削除する
      setUnapprovedIntroductions(unapprovedIntroductions.filter(introduction => introduction.actorUserId !== actorUserId));
    }
    catch(error) {
      console.error('却下処理に失敗', error);
    }
  };
  
  return <>
    <Typography component="h2" sx={{ mt: 3 }}>承認待ちの紹介一覧</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>承認待ちの紹介一覧の取得に失敗</Alert>}
    
    {status === 'succeeded' && unapprovedIntroductions.length === 0 && <Typography component="p" sx={{ mt: 3 }}>承認待ちの紹介はありません</Typography>}
    
    {status === 'succeeded' && unapprovedIntroductions.length > 0 && <>
      <Typography component="p" sx={{ mt: 3 }}>承認すると紹介文が一般公開されます。却下すると紹介文は削除されます (紹介者に通知は届きません)。</Typography>
      <List sx={{ mt: 3 }}>
        <Divider component="li" />
        {unapprovedIntroductions.map(introduction => <Fragment key={introduction.id}>
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
                    {epochTimeMsToJstString(introduction.updatedAt as string, 'YYYY-MM-DD HH:mm')}
                  </Grid2>
                </Grid2>
                <Grid2 container spacing={1} sx={{ mt: 1 }}>
                  <Grid2 size="grow" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    <FontParserComponent input={introduction.text} />
                  </Grid2>
                  <Grid2>
                    <Typography component="div">
                      <Button variant="contained" onClick={() => onApprove(introduction.actorUserId)}>承認</Button>
                    </Typography>
                    <Typography component="div" sx={{ mt: 1 }}>
                      <Button variant="contained" color="error" onClick={() => onUnapprove(introduction.actorUserId)}>却下</Button>
                    </Typography>
                  </Grid2>
                </Grid2>
              </>}
            />
          </ListItem>
          <Divider component="li" />
        </Fragment>)}
      </List>
    </>}
  </>;
};
