import { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';

import ReplyIcon from '@mui/icons-material/Reply';
import { Alert, Avatar, Box, Divider, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Tooltip, Typography } from '@mui/material';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
import { userConstants } from '../../constants/user-constants';
import { epochTimeMsToJstString } from '../../services/convert-date-to-jst';
import { BeforeReplyComponent } from './components/BeforeReplyComponent/BeforeReplyComponent';
import { EmojiReactionComponent } from './components/EmojiReactionComponent/EmojiReactionComponent';
import { FavouriteComponent } from './components/FavouriteComponent/FavouriteComponent';
import { PollComponent } from './components/PollComponent/PollComponent';

import type { Post } from '../../../common/types/post';
type Props = {
  propPosts: Array<Post>
};

/** Posts List Component */
export const PostsListComponent: FC<Props> = ({ propPosts }) => {
  if(propPosts == null || propPosts.length === 0) return <Typography component="p" sx={{ mt: 3 }}>投稿がありません</Typography>;
  
  return <>
    <List sx={{ mt: 3 }}>
      {propPosts.map(post => <Fragment key={post.id}>
        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
          <ListItemAvatar sx={{ minWidth: '50px' }}>
            <Tooltip title={post.userId} placement="top">
              <Link to={`/@${post.userId}`}><Avatar src={isEmptyString(post.user.avatarUrl) ? '' : `${userConstants.ossUrl}${post.user.avatarUrl}`} /></Link>
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
                  <Typography component={Link} to={`/@${post.userId}/posts/${post.id}`} className="hover-underline" sx={{ color: 'grey.600', fontSize: '.8rem' }}>{epochTimeMsToJstString(post.id, 'YYYY-MM-DD HH:mm:SS')}</Typography>
                </Grid2>
              </Grid2>
              
              {post.topicId === topicsConstants.englishOnly.id       && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>英語のみモード</Alert>}
              {post.topicId === topicsConstants.kanjiOnly.id         && <Alert severity="error"   icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>漢字のみモード</Alert>}
              {post.topicId === topicsConstants.senryu.id            && <Alert severity="success" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>川柳モード</Alert>}
              {post.topicId === topicsConstants.anonymous.id         && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25, borderColor: 'grey.500', color: 'grey.500' }}>匿名投稿モード</Alert>}
              {post.topicId === topicsConstants.randomDecorations.id && <Alert severity="warning" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>ランダム装飾モード</Alert>}
              {post.topicId === topicsConstants.randomLimit.id       && <Alert severity="error"   icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>ランダムリミットモード</Alert>}
              {post.topicId === topicsConstants.aiGenerated.id       && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>勝手に AI 生成モード</Alert>}
              <Typography component="div" sx={{ mt: .75, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                <FontParserComponent input={post.text} />
              </Typography>
              {post.topicId === topicsConstants.poll.id && <PollComponent propPost={post} />}
              
              <Typography component="div" sx={{ mt: .25 }}>
                <Tooltip title="リプする" placement="top"><IconButton component={Link} to={`/@${post.userId}/posts/${post.id}`} sx={{ mr: .25, color: 'grey.600' }} size="small"><ReplyIcon fontSize="inherit" /></IconButton></Tooltip>
                <FavouriteComponent propPost={post} />
                <EmojiReactionComponent propPost={post} />
              </Typography>
              
              {// リプライ元表示
                !isEmptyString(post.inReplyToPostId) && !isEmptyString(post.inReplyToUserId) && <Box component="div" sx={{ mt: 1, maxHeight: '7.85em', overflowY: 'hidden', border: '1px solid', borderColor: 'grey.500', borderRadius: 1, opacity: .8 }}>
                  <BeforeReplyComponent inReplyToPostId={post.inReplyToPostId} inReplyToUserId={post.inReplyToUserId} />
                </Box>
              }
            </>}
          />
        </ListItem>
        <Divider component="li" />
      </Fragment>)}
    </List>
  </>;
};
