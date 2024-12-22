import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert, Avatar, Grid2, List, ListItem, ListItemAvatar, ListItemText, Tooltip, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
import { httpStatusConstants } from '../../constants/http-status-constants';
import { userConstants } from '../../constants/user-constants';
import { useApiGet } from '../../hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../services/convert-date-to-jst';
import { LoadingSpinnerComponent } from '../LoadingSpinnerComponent/LoadingSpinnerComponent';

import type { Post, PostApi } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

type Props = {
  inReplyToPostId: string,
  inReplyToUserId: string
};

/** Before Reply Component */
export const BeforeReplyComponent: FC<Props> = ({ inReplyToPostId, inReplyToUserId }) => {
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'not-found' | 'failed'>('loading');
  const [post, setPost] = useState<Post>(null);
  
  // 初回読込
  useEffect(() => {
    setStatus('loading');
    (async () => {
      try {
        const response = await apiGet(`/users/${inReplyToUserId}/posts/${inReplyToPostId}`);  // Throws
        const postApiResult: Result<PostApi> = await response.json();  // Throws
        if(postApiResult.error != null) return setStatus(response.status === httpStatusConstants.notFound ? 'not-found' : 'failed');
        
        setPost(snakeToCamelCaseObject(postApiResult.result) as Post);
      }
      catch(error) {
        setStatus('failed');
        return console.error('投稿の取得に失敗', error);
      }
      
      setStatus('succeeded');
    })();
  }, [apiGet, inReplyToUserId, inReplyToPostId]);
  
  return <>
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'not-found' && <Alert severity="error" sx={{ mt: 1 }}>指定のリプライ元は存在しません</Alert>}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 1 }}>リプライ元の取得に失敗</Alert>}
    
    {status === 'succeeded' && <List sx={{ mt: 1 }}>
      <ListItem alignItems="flex-start" sx={{ border: '1px solid', borderColor: 'grey.500', borderRadius: 1 }}>
        <ListItemAvatar>
          <Tooltip title={post.userId} placement="top">
            <Link to={`/@${post.userId}`}>
              <Avatar src={isEmptyString(post.user.avatarUrl) ? '' : `${userConstants.ossUrl}${post.user.avatarUrl}`} />
            </Link>
          </Tooltip>
        </ListItemAvatar>
        <ListItemText
          primary={<>
            <Grid2 container spacing={1}>
              <Grid2 size="grow" sx={{ color: 'grey.600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <Typography component={Link} to={`/@${post.userId}`} className="hover-underline" sx={{ mr: 1, color: 'text.primary', fontWeight: 'bold' }}>{post.user.name}</Typography>
                <Typography component="span">@{post.userId}</Typography>
              </Grid2>
              <Grid2>
                <Typography component={Link} to={`/@${post.userId}/posts/${post.id}`} className="hover-underline" sx={{ color: 'grey.600', fontSize: '.8rem' }}>
                  {epochTimeMsToJstString(post.id, 'YYYY-MM-DD HH:mm:SS')}
                </Typography>
              </Grid2>
            </Grid2>
            <Typography component="div" sx={{ mt: .5, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              <FontParserComponent input={post.text} />
            </Typography>
          </>}
        />
      </ListItem>
    </List>}
  </>;
};
