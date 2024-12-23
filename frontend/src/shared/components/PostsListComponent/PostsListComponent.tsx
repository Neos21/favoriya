import { FC, Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ReplyIcon from '@mui/icons-material/Reply';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Alert, Avatar, Box, Button, Divider, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Modal, Stack, TextField, Tooltip, Typography } from '@mui/material';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
import { emojiConstants } from '../../constants/emoji-constants';
import { modalStyleConstants } from '../../constants/modal-style-constants';
import { userConstants } from '../../constants/user-constants';
import { useApiDelete, useApiGet, useApiPost } from '../../hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../services/convert-date-to-jst';
import { BeforeReplyComponent } from '../BeforeReplyComponent/BeforeReplyComponent';

import type { EmojiReaction, EmojiReactionApi } from '../../../common/types/emoji-reaction';
import type { RootState } from '../../stores/store';
import type { Post } from '../../../common/types/post';
import type { Emoji } from '../../../common/types/emoji';

type Props = {
  propPosts: Array<Post>
};

type ConvertedEmojiReaction = {
  /** 絵文字リアクション ID */
  id: number,
  /** 絵文字リアクション名 */
  name: string,
  /** 絵文字リアクションの画像パス */
  imageUrl: string,
  /** 絵文字リアクションを打ったユーザ一覧 */
  users: Array<{
    /** 絵文字リアクションを打った時の ID・削除に利用する */
    emojiReactionId: number,
    userId         : string,
    avatarUrl      : string
  }>
};

/** Posts List Component */
export const PostsListComponent: FC<Props> = ({ propPosts }) => {
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  const apiPost = useApiPost();
  const apiDelete = useApiDelete();
  
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  const [isEmojisModalOpen, setIsEmojisModalOpen] = useState<boolean>(false);  // 絵文字リアクションモーダル
  const [selectedPost, setSelectedPost] = useState<{ userId: string, postId: string }>(null);  // 絵文字リアクションモーダルを開いた時に選択した投稿
  const [emojis, setEmojis] = useState<Array<Emoji>>([]);  // 絵文字リアクション一覧
  
  // 初回読込 : 投稿一覧のセット・絵文字リアクション定義一覧
  useEffect(() => {
    setPosts(propPosts);
    (async () => {
      try {
        const response = await apiGet('/emojis');  // Throws
        const emojisApiResult = await response.json();  // Throws
        setEmojis(emojisApiResult.result.map(emojiApi => snakeToCamelCaseObject(emojiApi)));
      }
      catch(error) {
        setEmojis(null);
        console.error('絵文字リアクション一覧の取得に失敗', error);
      }
    })();
  }, [apiGet, propPosts]);
  
  if(propPosts == null || propPosts.length === 0) return <Typography component="p" sx={{ mt: 3 }}>投稿がありません</Typography>;
  
  /** 絵文字リアクションデータの構造を変換する */
  const convertEmojiReactions = (emojiReactions: Array<EmojiReaction>): Array<ConvertedEmojiReaction> => {
    const convertedEmojiReactions: Array<ConvertedEmojiReaction> = [];
    emojiReactions.forEach(emojiReaction => {
      const found = convertedEmojiReactions.find(convertedEmojiReaction => convertedEmojiReaction.id === emojiReaction.emojiId);
      if(found == null) {
        convertedEmojiReactions.push({
          id      : emojiReaction.emoji.id,
          name    : emojiReaction.emoji.name,
          imageUrl: emojiReaction.emoji.imageUrl,
          users   : [{
            emojiReactionId: emojiReaction.id,
            userId         : emojiReaction.reactionByUser.id,
            avatarUrl      : emojiReaction.reactionByUser.avatarUrl
          }]
        });
      }
      else {
        found.users.push({
          emojiReactionId: emojiReaction.id,
          userId         : emojiReaction.reactionByUser.id,
          avatarUrl      : emojiReaction.reactionByUser.avatarUrl
        });
      }
    });
    return convertedEmojiReactions;
  };
  
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
  
  /** 絵文字リアクションモーダルを開く */
  const onOpenEmojisModal = (userId: string, postId: string) => {
    setSelectedPost({ userId, postId });
    setIsEmojisModalOpen(true);
  };
  
  /** 絵文字リアクションモーダルを閉じる */
  const onCloseEmojisModal = () => {
    setSelectedPost(null);
    setIsEmojisModalOpen(false);
  };
  
  /** 絵文字リアクションを選択して登録する */
  const onSelectEmoji = async (emojiId: number, emojiName: string, emojiImageUrl: string, selectedPostsUserId: string, selectedPostId: string) => {
    try {
      // 既に押していないかチェックする
      const targetPost = posts.find(post => post.userId === selectedPostsUserId && post.id === selectedPostId);
      const targetEmojiReaction = targetPost.emojiReactions.find(emojiReaction => emojiReaction.emojiId === emojiId && emojiReaction.userId === userState.id);
      
      if(targetEmojiReaction == null) {
        // 絵文字リアクションを登録する
        const emojiReaction: EmojiReaction = {
          reactedPostsUserId: selectedPostsUserId,
          reactedPostId     : selectedPostId,
          userId            : userState.id,
          emojiId           : emojiId
        };
        const emojiReactionApi: EmojiReactionApi = camelToSnakeCaseObject(emojiReaction);
        const response = await apiPost(`/users/${selectedPostsUserId}/posts/${selectedPostId}/emojis`, emojiReactionApi);  // Throws
        const result = await response.json();  // Throws
        if(result.error != null) return console.error('絵文字リアクションの登録に失敗', result.error);
        // 対象の投稿の絵文字リアクション一覧に追加する
        setPosts(previousPosts => previousPosts.map(post =>
          post.userId === selectedPostsUserId && post.id === selectedPostId
            ? {
                ...post,
                emojiReactions: [...post.emojiReactions, {
                  id     : result.result.id,
                  emojiId: emojiId,
                  userId : userState.id,
                  emoji: {
                    id      : emojiId,
                    name    : emojiName,
                    imageUrl: emojiImageUrl
                  },
                  reactionByUser: {
                    id       : userState.id,
                    avatarUrl: userState.avatarUrl
                  }
                }]
              }
            : post
        ));
      }
      else {
        // 絵文字リアクションを削除する
        const response = await apiDelete(`/users/${selectedPostsUserId}/posts/${selectedPostId}/emojis/${targetEmojiReaction.id}`, `?user_id=${userState.id}`);
        if(!response.ok) return console.error('絵文字リアクションの削除に失敗', response);
        // 対象の投稿の絵文字リアクション一覧から削除する
        setPosts(previousPosts => previousPosts.map(post =>
          post.userId === selectedPostsUserId && post.id === selectedPostId
            ? {
                ...post,
                emojiReactions: post.emojiReactions.filter(emojiReaction => emojiReaction.id !== targetEmojiReaction.id)
              }
            : post
        ));
      }
    }
    catch(error) {
      console.error('絵文字リアクションの登録 or 削除処理に失敗', error);
    }
    finally {
      setSelectedPost(null);  // モーダルを閉じる
      setIsEmojisModalOpen(false);
    }
  };
  
  return <>
    <List sx={{ mt: 3 }}>
      {posts.map(post => <Fragment key={post.id}>
        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
          <ListItemAvatar sx={{ minWidth: '50px' }}>
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
              
              {post.topicId === topicsConstants.englishOnly.id       && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>英語のみモード</Alert>}
              {post.topicId === topicsConstants.kanjiOnly.id         && <Alert severity="error"   icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>漢字のみモード</Alert>}
              {post.topicId === topicsConstants.senryu.id            && <Alert severity="success" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>川柳モード</Alert>}
              {post.topicId === topicsConstants.anonymous.id         && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25, borderColor: 'grey.500', color: 'grey.500' }}>匿名投稿モード</Alert>}
              {post.topicId === topicsConstants.randomDecorations.id && <Alert severity="warning" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>ランダム装飾モード</Alert>}
              {post.topicId === topicsConstants.randomLimit.id       && <Alert severity="error"   icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>ランダムリミットモード</Alert>}
              <Typography component="div" sx={{ mt: .75, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                <FontParserComponent input={post.text} />
              </Typography>
              
              <Typography component="div" sx={{ mt: .25 }}>
                <Tooltip title="リプする" placement="top">
                  <IconButton component={Link} to={`/@${post.userId}/posts/${post.id}`} sx={{ mr: .25, color: 'grey.600' }} size="small"><ReplyIcon fontSize="inherit" /></IconButton>
                </Tooltip>
                
                {// ふぁぼ : 自分自身の投稿の場合
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
                {// ふぁぼ : 他人の投稿の場合
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
                
                <Tooltip title="絵文字リアクション" placement="top">
                  <IconButton sx={{ mr: .5, color: 'grey.600' }} size="small" onClick={() => onOpenEmojisModal(post.userId, post.id)}><EmojiEmotionsIcon fontSize="inherit" /></IconButton>
                </Tooltip>
                {convertEmojiReactions(post.emojiReactions).map(convertedEmojiReaction =>
                  <Tooltip placement="top"  key={convertedEmojiReaction.id} title={convertedEmojiReaction.users.map(user =>
                    <Typography component="div" key={user.userId}>
                      <Avatar src={isEmptyString(user.avatarUrl) ? '' : `${userConstants.ossUrl}${user.avatarUrl}`} sx={{ display: 'inline-block', width: '16px', height: '16px', verticalAlign: 'middle', mr: .5, ['& svg']: { width: '100%', marginTop: '3px' } }} />
                      <Typography component="span" sx={{ fontSize: '.86rem' }}>@{user.userId}</Typography>
                    </Typography>
                  )}>
                    <Button sx={{ p: .25, mr: 1, minWidth: 'auto', color: 'grey.600' }} onClick={() => onSelectEmoji(convertedEmojiReaction.id, convertedEmojiReaction.name, convertedEmojiReaction.imageUrl, post.userId, post.id)}>
                      <img src={`${emojiConstants.ossUrl}${convertedEmojiReaction.imageUrl}`} height="16" alt={`:${convertedEmojiReaction.name}:`} />
                      <Typography component="span" sx={{ ml: .5 }}>{convertedEmojiReaction.users.length}</Typography>
                    </Button>
                  </Tooltip>
                )}
                
              </Typography>
              
              {// リプライ元表示
                !isEmptyString(post.inReplyToPostId) && !isEmptyString(post.inReplyToUserId) && <Box component="div" sx={{ mt: 1, maxHeight: '8em', overflowY: 'hidden', border: '1px solid', borderColor: 'grey.500', borderRadius: 1, opacity: .8 }}>
                  <BeforeReplyComponent inReplyToPostId={post.inReplyToPostId} inReplyToUserId={post.inReplyToUserId} />
                </Box>
              }
            </>}
          />
        </ListItem>
        <Divider component="li" />
      </Fragment>)}
    </List>
    
    <Modal open={isEmojisModalOpen}>
      <Box component="div" sx={modalStyleConstants}>
        <Stack direction="row" spacing={1}>
          <TextField name="emoji" label="検索" fullWidth margin="normal" size="small" sx={{ m: 0 }} disabled />
          <IconButton sx={{ color: 'grey.600' }} size="small" onClick={onCloseEmojisModal}><CloseIcon fontSize="inherit" /></IconButton>
        </Stack>
        <Box component="div" sx={{ mt: 2, maxHeight: '47vh', overflowY: 'auto' }}>
          {emojis.map(emoji => <Button key={emoji.id} sx={{ p: .25, mr: .5, minWidth: 'auto' }} onClick={() => onSelectEmoji(emoji.id, emoji.name, emoji.imageUrl, selectedPost.userId, selectedPost.postId)}>
            <img src={`${emojiConstants.ossUrl}${emoji.imageUrl}`} height="24" alt={`:${emoji.name}:`} title={`:${emoji.name}:`} />
          </Button>)}
        </Box>
      </Box>
    </Modal>
  </>;
};
