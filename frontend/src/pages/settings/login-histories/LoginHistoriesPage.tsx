import { FC, Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Alert, Button, Divider, Grid2, List, ListItem, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { LoadingSpinnerComponent } from '../../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { useApiGet } from '../../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../../shared/services/convert-date-to-jst';

import type { RootState } from '../../../shared/stores/store';
import type { LoginHistory, LoginHistoryApi } from '../../../common/types/login-history';
import type { Result } from '../../../common/types/result';

/** Login Histories Page */
export const LoginHistoriesPage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [loginHistories, setLoginHistories] = useState<Array<LoginHistory>>([]);
  
  useEffect(() => {
    setStatus('loading');
    (async () => {
      try {
        const response = await apiGet(`/users/${userState.id}/login-histories`);  // Throws
        const loginHistoriesApiResult: Result<Array<LoginHistoryApi>> = await response.json();  // Throws
        if(loginHistoriesApiResult.error != null) return setStatus('failed');
        
        setLoginHistories(snakeToCamelCaseObject(loginHistoriesApiResult.result) as Array<LoginHistory>);
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('ログイン履歴一覧の取得に失敗', error);
      }
    })();
  }, [apiGet, userState.id]);
  
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>ログイン履歴</Typography>
    
    <Typography component="p" sx={{ mt: 3 }}>
      <Button component={Link} to="/settings" variant="contained">戻る</Button>
    </Typography>
    
    <Divider sx={{ mt: 4 }} />
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>ログイン履歴一覧の取得に失敗</Alert>}
    
    {status === 'succeeded' && loginHistories.length === 0 && <Typography component="p" sx={{ mt: 3 }}>ログイン履歴は保存されていません</Typography>}
    
    {status === 'succeeded' && loginHistories.length > 0 && <List sx={{ mt: 3 }}>
      {loginHistories.map((loginHistory, index) => <Fragment key={index}>
        <ListItem alignItems="center" sx={{ px: 0 }}>
          <ListItemText
            primary={
              <Grid2 container spacing={.5}>
                <Grid2 size={12}>最終アクセス {epochTimeMsToJstString(loginHistory.updatedAt as string, 'YYYY-MM-DD HH:mm:SS')}</Grid2>
                <Grid2 size={ 2} sx={{ whiteSpace: 'nowrap' }}>IP</Grid2>
                <Grid2 size={10}>{loginHistory.ip}</Grid2>
                <Grid2 size={ 2} sx={{ whiteSpace: 'nowrap' }}>UA</Grid2>
                <Grid2 size={10}>{loginHistory.ua}</Grid2>
              </Grid2>
            }
          />
        </ListItem>
        <Divider component="li" />
      </Fragment>)}
    </List>}
  </>;
};
