import { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
import { userConstants } from '../../constants/user-constants';
import { epochTimeMsToJstString } from '../../services/convert-date-to-jst';

import type { Post } from '../../../common/types/post';

type Props = {
  posts: Array<Post>
}

/** Posts List Component */
export const PostsListComponent: FC<Props> = ({ posts }) => {
  if(posts == null || posts.length === 0) return <Typography component="p" sx={{ mt: 3 }}>投稿がありません</Typography>;
  
  return (
    <List sx={{ mt: 3 }}>
      {posts.map(post => <Fragment key={post.id}>
        <ListItem alignItems="flex-start" sx={{ wordBreak: 'break-all', px: 0 }}>
          <ListItemAvatar>
            <Avatar src={isEmptyString(post.user.avatarUrl) ? '' : `${userConstants.ossUrl}${post.user.avatarUrl}`} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography component="p">
                <Typography component="strong" sx={{ mr: 1, fontWeight: 'bold' }}>
                  <Link to={`/@${post.userId}`} className="hover-underline">{post.user.name}</Link>
                </Typography>
                <Typography component="span" sx={{ color: '#999' }}>
                  @{post.userId}
                  <Typography component="span" sx={{ fontSize: '.8rem' }}>
                    <Typography component="span" sx={{ mx: 1 }}>-</Typography>
                    <Link to={`/@${post.userId}/posts/${post.id}`} className="hover-underline">{epochTimeMsToJstString(post.id, 'YYYY-MM-DD HH:mm:SS')}</Link>
                  </Typography>
                </Typography>
              </Typography>
            }
            secondary={
              <Typography component="div" sx={{ mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                <FontParserComponent input={post.text} />
              </Typography>
            }
          />
        </ListItem>
        <Divider component="li" />
      </Fragment>)}
    </List>
  );
};
