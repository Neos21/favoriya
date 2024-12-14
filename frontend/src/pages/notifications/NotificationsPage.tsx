import { FC, Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import { Alert, Avatar, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { isEmptyString } from '../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { userConstants } from '../../shared/constants/user-constants';
import { useApiGet, useApiPatch } from '../../shared/hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../shared/services/convert-date-to-jst';

import type { Result } from '../../common/types/result';
import type { RootState } from '../../shared/stores/store';
import type { Notification, NotificationApi } from '../../common/types/notification';
/** Notifications Page */
export const NotificationsPage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  
  const apiGet = useApiGet();
  const apiPatch = useApiPatch();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [notifications, setNotifications] = useState<Array<Notification>>([]);
  
  // 初回読み込み
  useEffect(() => {
    setStatus('loading');
    (async () => {
      try {
        const response = await apiGet('/notifications', `?user_id=${userState.id}`);  // Throws
        const notificationsApiResult: Result<Array<NotificationApi>> = await response.json();  // Throws
        if(notificationsApiResult.error != null) return setStatus('failed');
        
        setNotifications(notificationsApiResult.result.map(notificationApi => snakeToCamelCaseObject(notificationApi)) as Array<Notification>);
        setStatus('succeeded');
      }
      catch(error) {
        setStatus('failed');
        return console.error('通知一覧の取得に失敗', error);
      }
    })();
  }, [apiGet, userState.id]);
  
  /** 通知を既読にする */
  const onReadItem = async (id: number) => {
    try {
      await apiPatch(`/notifications/${id}`, {
        recipient_user_id: userState.id,  // 本人確認用
        is_read          : true
      });
    }
    catch(error) {
      console.error('通知の既読処理に失敗', error);
    }
    finally {
      setNotifications(notifications.map(notification => {
        if(notification.id === id) notification.isRead = true;
        return notification;
      }));
    }
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>通知一覧</Typography>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>通知一覧の取得に失敗</Alert>}
    
    {status === 'succeeded' && notifications.length === 0 && <Typography component="p" sx={{ mt: 3 }}>通知はありません</Typography>}
    
    {status === 'succeeded' && notifications.length > 0 && <>
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
        未読 {notifications.filter(notification => !notification.isRead).length} 件 / 全 {notifications.length} 件
      </Typography>
      <List sx={{ mt: 3 }}>
        <Divider component="li" />
        {notifications.map(notification => <Fragment key={notification.id}>
          <ListItem
            alignItems="center" sx={{ px: 0, opacity: notification.isRead ? .5 : 1 }}
            secondaryAction={
              <IconButton edge="end" disabled={notification.isRead} onClick={() => onReadItem(notification.id)}>
                <CheckIcon color={notification.isRead ? 'disabled' : 'success'} />
              </IconButton>
            }
          >
            <ListItemAvatar sx={{ position: 'relative' }}>
              <Link to={`/@${notification.actorUserId}`}>
                <Avatar src={isEmptyString(notification.actorUser.avatarUrl) ? '' : `${userConstants.ossUrl}${notification.actorUser.avatarUrl}`} />
                {notification.notificationType === 'favourite' && <StarIcon             color="warning" sx={{ position: 'absolute', right: '.75rem', bottom: '-.25rem' }} />}
                {notification.notificationType === 'follow'    && <AddCircleOutlineIcon color="success" sx={{ position: 'absolute', right: '.75rem', bottom: '-.25rem' }} />}
              </Link>
            </ListItemAvatar>
            <ListItemText
              sx={{ mr: 6 }}
              primary={<>
                <Typography component="div" sx={{ color: 'grey.600', fontSize: '.86rem' }}>{epochTimeMsToJstString(notification.createdAt as string, 'YYYY-MM-DD HH:mm:SS')}</Typography>
                {notification.notificationType === 'favourite' && <Link to={`/@${userState.id}/posts/${notification.postId}`} className="hover-underline">{notification.message}</Link>}
                {notification.notificationType === 'follow'    && <Link to={`/@${notification.actorUserId}`} className="hover-underline">{notification.message}</Link>}
              </>}
            />
          </ListItem>
          <Divider component="li" />
        </Fragment>)}
      </List>
    </>}
  </>;
};
