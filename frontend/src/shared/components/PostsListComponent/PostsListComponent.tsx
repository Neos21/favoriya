import { FC, Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Avatar, Divider, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
import { userConstants } from '../../constants/user-constants';
import { useApiDelete, useApiPost } from '../../hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../services/convert-date-to-jst';
import { RootState } from '../../stores/store';

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
      favourites.push({ userId: userState.id });
      setPosts(prevPosts => prevPosts.map(prevPost => prevPost.id === post.id
        ? { ...prevPost, favouritesCount: post.favouritesCount + 1, favourites }
        : prevPost
      ));
    }
    catch(error) {
      console.error('ふぁぼ付け処理中にエラーが発生しました', error);
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
      setPosts(prevPosts => prevPosts.map(prevPost => prevPost.id === post.id
        ? { ...prevPost, favouritesCount: post.favouritesCount - 1, favourites }
        : prevPost
      ));
    }
    catch(error) {
      console.error('ふぁぼ付け処理中にエラーが発生しました', error);
    }
  };
  
  console.log(posts);
  
  return <List sx={{ mt: 3 }}>
    {posts.map(post => <Fragment key={post.id}>
      <ListItem alignItems="flex-start" sx={{ wordBreak: 'break-all', px: 0 }}>
        <ListItemAvatar>
          <Avatar src={isEmptyString(post.user.avatarUrl) ? '' : `${userConstants.ossUrl}${post.user.avatarUrl}`} />
        </ListItemAvatar>
        <ListItemText
          primary={<>
            <Grid2 container spacing={1}>
              <Grid2 size="grow" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <Typography component={Link} to={`/@${post.userId}`} className="hover-underline" sx={{ mr: 1, fontWeight: 'bold' }}>{post.user.name}</Typography>
                <Typography component="span" sx={{ color: '#999' }}>@{post.userId}</Typography>
              </Grid2>
              <Grid2>
                <Typography component={Link} to={`/@${post.userId}/posts/${post.id}`} className="hover-underline" sx={{ color: '#999', fontSize: '.8rem' }}>
                  {epochTimeMsToJstString(post.id, 'YYYY-MM-DD HH:mm:SS')}
                </Typography>
              </Grid2>
            </Grid2>
            <Typography component="div" sx={{ mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              <FontParserComponent input={post.text} />
            </Typography>
            <Typography component="div">
              {// 自分自身の投稿の場合
                post.userId === userState.id && <>
                  <IconButton sx={{ mr: .25 }} disabled size="small"><StarIcon fontSize="inherit" /></IconButton>
                  {userState.showOwnFavouritesCount && <Typography component="span" sx={{ verticalAlign: 'bottom' }}>{post.favouritesCount}</Typography>}
                </>
              }
              {// 他人の投稿の場合
                post.userId !== userState.id && <>
                {post.favourites.find(favourite => favourite.userId === userState.id) == null
                  ? <IconButton sx={{ mr: .25 }} size="small" onClick={() => onAddFavourite(post)}><StarBorderIcon fontSize="inherit" /></IconButton>
                  : <IconButton sx={{ mr: .25 }} color="warning" size="small" onClick={() => onRemoveFavourite(post)}><StarIcon fontSize="inherit" /></IconButton>
                }
                {userState.showOthersFavouritesCount && <Typography component="span" sx={{ verticalAlign: 'bottom' }}>{post.favouritesCount}</Typography>}
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
