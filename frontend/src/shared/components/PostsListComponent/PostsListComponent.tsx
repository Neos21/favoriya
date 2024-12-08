import { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material';

import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
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
          <ListItemText
            primary={
              <Typography component="p">
                <Typography component="strong" sx={{ mr: 1, fontWeight: 'bold' }}>
                  <Link to={'/@' + post.userId} className="hover-underline">{post.user.name}</Link>
                </Typography>
                <Typography component="span" sx={{ color: '#999' }}>
                  @{post.userId}
                  <Typography component="span" sx={{ fontSize: '.8rem' }}> - {epochTimeMsToJstString(post.id, 'YYYY-MM-DD HH:mm:SS')}</Typography>
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
