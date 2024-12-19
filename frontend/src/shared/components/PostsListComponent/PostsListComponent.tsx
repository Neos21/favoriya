import { FC, Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Alert, Avatar, Divider, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Tooltip, Typography } from '@mui/material';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
import { userConstants } from '../../constants/user-constants';
import { useApiDelete, useApiPost } from '../../hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../services/convert-date-to-jst';

import type { RootState } from '../../stores/store';
import type { Post } from '../../../common/types/post';

type Props = {
  propPosts: Array<Post>
}

/** Posts List Component */
export const PostsListComponent: FC<Props> = ({ propPosts }) => {
  const userState = useSelector((state: RootState) => state.user);
  const apiPost = useApiPost();
  const apiDelete = useApiDelete();
  
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  useEffect(() => {
    setPosts(propPosts);
  }, [propPosts]);
  
  if(propPosts == null || propPosts.length === 0) return <Typography component="p" sx={{ mt: 3 }}>投稿がありません</Typography>;
  
  /** ふぁぼを付ける */
  const onAddFavourite = async (post: Post) => {
    try {
      await apiPost(`/users/${post.userId}/posts/${post.id}/favourites`, { user_id: userState.id });  // Throws
      // ふぁぼしたユーザ一覧に自分を追加する
      const favourites = post.favourites;
      favourites.push({
        userId: userState.id,
        favouritedByUser: {
          id: userState.id,
          avatarUrl: userState.avatarUrl
        }
      });
      setPosts(previousPosts => previousPosts.map(previousPost => previousPost.id === post.id
        ? { ...previousPost, favouritesCount: post.favouritesCount + 1, favourites }
        : previousPost
      ));
    }
    catch(error) {
      console.error('ふぁぼ付け処理中にエラーが発生', error);
    }
  };
  
  /** ふぁぼを外す */
  const onRemoveFavourite = async (post: Post) => {
    try {
      await apiDelete(`/users/${post.userId}/posts/${post.id}/favourites`, `?user_id=${userState.id}`);  // Throws
      // ふぁぼしたユーザ一覧から自分を削除する
      const favourites = post.favourites;
      const favouritesIndex = favourites.findIndex(favourite => favourite.userId === userState.id);
      favourites.splice(favouritesIndex, 1);
      setPosts(previousPosts => previousPosts.map(previousPost => previousPost.id === post.id
        ? { ...previousPost, favouritesCount: post.favouritesCount - 1, favourites }
        : previousPost
      ));
    }
    catch(error) {
      console.error('ふぁぼ外し処理中にエラーが発生', error);
    }
  };
  
  return <List sx={{ mt: 3 }}>
    {posts.map(post => <Fragment key={post.id}>
      <ListItem alignItems="flex-start" sx={{ wordBreak: 'break-all', px: 0 }}>
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
            {post.topicId === topicsConstants.englishOnly.id && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>英語のみモード</Alert>}
            {post.topicId === topicsConstants.kanjiOnly.id   && <Alert severity="error"   icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>漢字のみモード</Alert>}
            {post.topicId === topicsConstants.senryu.id      && <Alert severity="success" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>川柳モード</Alert>}
            {post.topicId === topicsConstants.anonymous.id   && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25, borderColor: 'grey.500', color: 'grey.500' }}>匿名投稿モード</Alert>}
            <Typography component="div" sx={{ mt: .5, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              <FontParserComponent input={post.text} />
            </Typography>
            <Typography component="div" sx={{ mt: .25 }}>
              {// 自分自身の投稿の場合
                post.userId === userState.id && <>
                  <IconButton sx={{ mr: .25 }} disabled size="small"><StarIcon fontSize="inherit" /></IconButton>
                  {userState.showOwnFavouritesCount && <>
                    <Typography component="span" sx={{ mr: 1, color: 'grey.600', fontSize: '.86rem', verticalAlign: 'middle' }}>{post.favouritesCount}</Typography>
                    {post.favourites.map(favourite =>
                      <Tooltip title={favourite.favouritedByUser.id} placement="top" key={favourite.favouritedByUser.id}>
                        <Link to={`/@${favourite.favouritedByUser.id}`}>
                          <Avatar src={isEmptyString(favourite.favouritedByUser.avatarUrl) ? '' : `${userConstants.ossUrl}${favourite.favouritedByUser.avatarUrl}`} sx={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle', mr: .5, ['& svg']: { width: '100%', marginTop: '3px' } }} />
                        </Link>
                      </Tooltip>
                    )}
                  </>}
                </>
              }
              {// 他人の投稿の場合
                post.userId !== userState.id && <>
                {post.favourites.find(favourite => favourite.favouritedByUser.id === userState.id) == null
                  ? <IconButton sx={{ mr: .25, color: 'grey.600' }} size="small" onClick={() => onAddFavourite(post)}><StarBorderIcon fontSize="inherit" /></IconButton>
                  : <IconButton sx={{ mr: .25 }} color="warning" size="small" onClick={() => onRemoveFavourite(post)}><StarIcon fontSize="inherit" /></IconButton>
                }
                {userState.showOthersFavouritesCount && <>
                  <Typography component="span" sx={{ mr: 1, color: 'grey.600', fontSize: '.86rem', verticalAlign: 'middle' }}>{post.favouritesCount}</Typography>
                  {post.favourites.map(favourite =>
                    <Tooltip title={favourite.favouritedByUser.id} placement="top" key={favourite.favouritedByUser.id}>
                      <Link to={`/@${favourite.favouritedByUser.id}`}>
                        <Avatar src={isEmptyString(favourite.favouritedByUser.avatarUrl) ? '' : `${userConstants.ossUrl}${favourite.favouritedByUser.avatarUrl}`} sx={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle', mr: .5, ['& svg']: { width: '100%', marginTop: '3px' } }} />
                      </Link>
                    </Tooltip>
                  )}
                </>}
              </>
            }
            </Typography>
          </>}
        />
      </ListItem>
      <Divider component="li" />
    </Fragment>)}
  </List>;
};
