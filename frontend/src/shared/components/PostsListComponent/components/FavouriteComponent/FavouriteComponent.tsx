import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Avatar, IconButton, Tooltip, Typography } from '@mui/material';

import { isEmptyString } from '../../../../../common/helpers/is-empty-string';
import { userConstants } from '../../../../constants/user-constants';
import { useApiDelete, useApiPost } from '../../../../hooks/use-api-fetch';

import type { RootState } from '../../../../stores/store';
import type { Post } from '../../../../../common/types/post';

type Props = {
  propPost: Post
};

/** Favourite Component */
export const FavouriteComponent: FC<Props> = ({ propPost }) => {
  const userState = useSelector((state: RootState) => state.user);
  const apiPost = useApiPost();
  const apiDelete = useApiDelete();
  
  const [post, setPost] = useState<Post>(propPost);
  
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
      setPost(previousPost => ({ ...previousPost, favourites }));
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
      setPost(previousPost => ({ ...previousPost, favourites }));
    }
    catch(error) {
      console.error('ふぁぼ外し処理中にエラーが発生', error);
    }
  };
  
  // ふぁぼ : 自分自身の投稿の場合
  if(post.userId === userState.id) return <>
    <IconButton sx={{ mr: .25 }} disabled size="small"><StarIcon fontSize="inherit" /></IconButton>
    {userState.showOwnFavouritesCount && <>
      <Typography component="span" sx={{ mr: 1, color: 'grey.600', fontSize: '.86rem', verticalAlign: 'middle' }}>{post.favourites.length}</Typography>
      {post.favourites.map(favourite =>
        <Tooltip title={favourite.favouritedByUser.id} placement="top" key={favourite.favouritedByUser.id}>
          <Link to={`/@${favourite.favouritedByUser.id}`}>
            <Avatar src={isEmptyString(favourite.favouritedByUser.avatarUrl) ? '' : `${userConstants.ossUrl}${favourite.favouritedByUser.avatarUrl}`} sx={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle', mr: .5, ['& svg']: { width: '100%', marginTop: '3px' } }} />
          </Link>
        </Tooltip>
      )}
    </>}
  </>;
  
  // ふぁぼ : 他人の投稿の場合
  if(post.userId !== userState.id) return <>
    {post.favourites.find(favourite => favourite.favouritedByUser.id === userState.id) == null
      ? <IconButton sx={{ mr: .25, color: 'grey.600' }} size="small" onClick={() => onAddFavourite(post)}><StarBorderIcon fontSize="inherit" /></IconButton>
      : <IconButton sx={{ mr: .25 }} color="warning" size="small" onClick={() => onRemoveFavourite(post)}><StarIcon fontSize="inherit" /></IconButton>
    }
    {userState.showOthersFavouritesCount && <>
      <Typography component="span" sx={{ mr: 1, color: 'grey.600', fontSize: '.86rem', verticalAlign: 'middle' }}>{post.favourites.length}</Typography>
      {post.favourites.map(favourite =>
        <Tooltip title={favourite.favouritedByUser.id} placement="top" key={favourite.favouritedByUser.id}>
          <Link to={`/@${favourite.favouritedByUser.id}`}>
            <Avatar src={isEmptyString(favourite.favouritedByUser.avatarUrl) ? '' : `${userConstants.ossUrl}${favourite.favouritedByUser.avatarUrl}`} sx={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle', mr: .5, ['& svg']: { width: '100%', marginTop: '3px' } }} />
          </Link>
        </Tooltip>
      )}
    </>}
  </>;
};
