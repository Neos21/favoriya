import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { Avatar, Box, Button, IconButton, Modal, Stack, TextField, Tooltip, Typography } from '@mui/material';

import { camelToSnakeCaseObject } from '../../../../../common/helpers/convert-case';
import { isEmptyString } from '../../../../../common/helpers/is-empty-string';
import { emojiConstants } from '../../../../constants/emoji-constants';
import { modalStyleConstants } from '../../../../constants/modal-style-constants';
import { userConstants } from '../../../../constants/user-constants';
import { useApiDelete, useApiPost } from '../../../../hooks/use-api-fetch';

import type { EmojiReaction, EmojiReactionApi } from '../../../../../common/types/emoji-reaction';
import type { RootState } from '../../../../stores/store';
import type { Post } from '../../../../../common/types/post';
import type { Emoji } from '../../../../../common/types/emoji';

type Props = {
  propPost: Post
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

/** Emoji Reaction Component */
export const EmojiReactionComponent: FC<Props> = ({ propPost }) => {
  const userState = useSelector((state: RootState) => state.user);
  const emojisState = useSelector((state: RootState) => state.emojis);
  const apiPost = useApiPost();
  const apiDelete = useApiDelete();
  
  const [post, setPost] = useState<Post>(propPost);
  
  const [isEmojisModalOpen, setIsEmojisModalOpen] = useState<boolean>(false);  // 絵文字リアクションモーダル
  const [emojis, setEmojis] = useState<Array<Emoji>>([]);  // 絵文字リアクション一覧
  const [filteredEmojis, setFilteredEmojis] = useState<Array<Emoji>>([]);  // インクリメンタル検索した時の一覧
  const [emojiQuery, setEmojiQuery] = useState('');
  
  // 初回読込 : 絵文字リアクションが Store にキャッシュがなければ取得する
  useEffect(() => {
    setEmojis([...emojisState.emojis]);
    setFilteredEmojis([...emojisState.emojis]);
  }, [emojisState.emojis]);
  
  /** 絵文字リアクションデータの構造を変換する */
  const convertEmojiReactions = (emojiReactions: Array<EmojiReaction>): Array<ConvertedEmojiReaction> => {
    const convertedEmojiReactions: Array<ConvertedEmojiReaction> = [];
    emojiReactions.forEach(emojiReaction => {
      const found = convertedEmojiReactions.find(convertedEmojiReaction => convertedEmojiReaction.id === emojiReaction.emojiId);
      if(found == null) {
        convertedEmojiReactions.push({
          id      : emojiReaction?.emoji?.id,
          name    : emojiReaction?.emoji?.name,
          imageUrl: emojiReaction?.emoji?.imageUrl,
          users   : [{
            emojiReactionId: emojiReaction?.id,
            userId         : emojiReaction?.reactionByUser?.id,
            avatarUrl      : emojiReaction?.reactionByUser?.avatarUrl
          }]
        });
      }
      else {
        found.users.push({
          emojiReactionId: emojiReaction?.id,
          userId         : emojiReaction?.reactionByUser?.id,
          avatarUrl      : emojiReaction?.reactionByUser?.avatarUrl
        });
      }
    });
    return convertedEmojiReactions;
  };
  
  /** 絵文字リアクションモーダルを開く */
  const onOpenEmojisModal = () => {
    setFilteredEmojis([...emojis]);  // デフォルトは全部入れておく
    setIsEmojisModalOpen(true);
  };
  
  /** 絵文字リアクションモーダルを閉じる */
  const onCloseEmojisModal = () => {
    setFilteredEmojis([...emojis]);  // 元に戻しておく
    setIsEmojisModalOpen(false);
  };
  
  /** 絵文字をインクリメンタル検索する */
  const onSearchEmojis = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();  // 小文字に変換する
    setEmojiQuery(query);
    const filtered = emojis.filter(emoji => emoji.name.includes(query));  // 部分一致検索
    setFilteredEmojis(filtered);
  };
  
  /** 絵文字リアクションを選択して登録する */
  const onSelectEmoji = async (emojiId: number, emojiName: string, emojiImageUrl: string) => {
    try {
      // 既に押していないかチェックする
      const targetEmojiReaction = post.emojiReactions.find(emojiReaction => emojiReaction.emojiId === emojiId && emojiReaction.userId === userState.id);
      
      if(targetEmojiReaction == null) {
        // 絵文字リアクションを登録する
        const emojiReaction: EmojiReaction = {
          reactedPostsUserId: post.userId,
          reactedPostId     : post.id,
          userId            : userState.id,
          emojiId           : emojiId
        };
        const emojiReactionApi: EmojiReactionApi = camelToSnakeCaseObject(emojiReaction);
        const response = await apiPost(`/users/${post.userId}/posts/${post.id}/emojis`, emojiReactionApi);  // Throws
        const result = await response.json();  // Throws
        if(result.error != null) return console.error('絵文字リアクションの登録に失敗', result.error);
        // 対象の投稿の絵文字リアクション一覧に追加する
        setPost(previousPost => ({
          ...previousPost,
          emojiReactions: [...previousPost.emojiReactions, {
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
        }));
      }
      else {
        // 絵文字リアクションを削除する
        const response = await apiDelete(`/users/${post.userId}/posts/${post.id}/emojis/${targetEmojiReaction.id}`, `?user_id=${userState.id}`);
        if(!response.ok) return console.error('絵文字リアクションの削除に失敗', response);
        // 対象の投稿の絵文字リアクション一覧から削除する
        setPost(previousPost => ({
          ...previousPost,
          emojiReactions: previousPost.emojiReactions.filter(emojiReaction => emojiReaction.id !== targetEmojiReaction.id)
        }));
      }
    }
    catch(error) {
      console.error('絵文字リアクションの登録 or 削除処理に失敗', error);
    }
    finally {
      setIsEmojisModalOpen(false);
    }
  };
  
  return <>
    <Tooltip title="絵文字リアクション" placement="top">
      <IconButton sx={{ mr: .5, color: 'grey.600' }} size="small" onClick={onOpenEmojisModal}><EmojiEmotionsIcon fontSize="inherit" /></IconButton>
    </Tooltip>
    
    {convertEmojiReactions(post.emojiReactions).map(convertedEmojiReaction =>
      <Tooltip placement="top" key={convertedEmojiReaction.id} title={convertedEmojiReaction.users.map(user =>
        <Typography component="div" key={user.userId}>
          <Avatar src={isEmptyString(user.avatarUrl) ? '' : `${userConstants.ossUrl}${user.avatarUrl}`} sx={{ display: 'inline-block', width: '16px', height: '16px', verticalAlign: 'middle', mr: .5, ['& svg']: { width: '100%', marginTop: '3px' } }} />
          <Typography component="span" sx={{ fontSize: '.86rem' }}>@{user.userId}</Typography>
        </Typography>
      )}>
        <Button sx={{ p: .25, mr: 1, minWidth: 'auto', color: 'grey.600' }} onClick={() => onSelectEmoji(convertedEmojiReaction.id, convertedEmojiReaction.name, convertedEmojiReaction.imageUrl)}>
          <img src={`${emojiConstants.ossUrl}${convertedEmojiReaction.imageUrl}`} height="16" alt={`:${convertedEmojiReaction.name}:`} />
          <Typography component="span" sx={{ ml: .5 }}>{convertedEmojiReaction.users.length}</Typography>
        </Button>
      </Tooltip>
    )}
    
    <Modal open={isEmojisModalOpen} onClose={onCloseEmojisModal}>
      <Box component="div" sx={modalStyleConstants}>
        <Stack direction="row" spacing={1}>
          <TextField name="emoji" label="検索" fullWidth margin="normal" size="small" sx={{ m: 0 }} value={emojiQuery} onChange={onSearchEmojis} />
          <IconButton sx={{ color: 'grey.600' }} size="small" onClick={onCloseEmojisModal}><CloseIcon fontSize="inherit" /></IconButton>
        </Stack>
        <Box component="div" sx={{ mt: 2, maxHeight: '47vh', overflowY: 'auto' }}>
          {filteredEmojis.map(emoji =>
            <Tooltip placement="top" key={emoji.id} title={`:${emoji.name}:`}>
              <Button sx={{ p: .25, mt: .5, mr: .5, minWidth: 'auto' }} onClick={() => onSelectEmoji(emoji.id, emoji.name, emoji.imageUrl)}>
                <img src={`${emojiConstants.ossUrl}${emoji.imageUrl}`} height="24" alt={`:${emoji.name}:`} />
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Modal>
  </>;
};
