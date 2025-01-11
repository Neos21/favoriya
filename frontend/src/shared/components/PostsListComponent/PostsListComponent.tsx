import { FC, Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

import FileOpenIcon from '@mui/icons-material/FileOpen';
import ReplyIcon from '@mui/icons-material/Reply';
import { Alert, Avatar, Box, Divider, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Modal, Tooltip, Typography } from '@mui/material';

import { commonTopicsConstants } from '../../../common/constants/topics-constants';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../components/FontParserComponent/FontParserComponent';
import { modalStyleConstants } from '../../constants/modal-style-constants';
import { postConstants } from '../../constants/post-constants';
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalFilePath, setModalFilePath] = useState<string>(null);
  
  if(propPosts == null || propPosts.length === 0) return <Typography component="p" sx={{ mt: 3 }}>投稿がありません</Typography>;
  
  const onOpenModal = (filePath: string) => {
    setModalFilePath(filePath);
    setIsModalOpen(true);
  };
  const onCloseModal = () => {
    setIsModalOpen(false);
    setModalFilePath(null);
  };
  
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
                  <Typography component={Link} to={`/@${post.userId}/posts/${post.id}`} className="hover-underline" sx={{ color: 'grey.600', fontSize: '.8rem' }}>{epochTimeMsToJstString(post.id, 'YYYY-MM-DD HH:mm')}</Typography>
                </Grid2>
              </Grid2>
              
              {post.topicId === commonTopicsConstants.englishOnly.id       && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>英語のみモード</Alert>}
              {post.topicId === commonTopicsConstants.kanjiOnly.id         && <Alert severity="error"   icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>漢字のみモード</Alert>}
              {post.topicId === commonTopicsConstants.senryu.id            && <Alert severity="success" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>川柳モード</Alert>}
              {post.topicId === commonTopicsConstants.anonymous.id         && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25, borderColor: 'grey.500', color: 'grey.500' }}>匿名投稿モード</Alert>}
              {post.topicId === commonTopicsConstants.randomDecorations.id && <Alert severity="warning" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>ランダム装飾モード</Alert>}
              {post.topicId === commonTopicsConstants.randomLimit.id       && <Alert severity="error"   icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>ランダムリミットモード</Alert>}
              {post.topicId === commonTopicsConstants.aiGenerated.id       && <Alert severity="success" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>勝手に AI 生成モード</Alert>}
              {post.topicId === commonTopicsConstants.imageOnly.id         && <Alert severity="warning" icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>画像のみモード</Alert>}
              {post.topicId === commonTopicsConstants.movaPic.id           && <Alert severity="info"    icon={false} variant="outlined" sx={{ mt: 1, py: .25 }}>携帯百景モード</Alert>}
              
              {/* ほとんどの通常モード */}
              {post.topicId !== commonTopicsConstants.imageOnly.id && <>
                <Typography component="div" sx={{ mt: .75, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  <FontParserComponent input={post.text} />
                </Typography>
                
                {post.attachment != null && <Box component="div" sx={{ mt: 1 }}>
                  {post.attachment.mimeType.startsWith('image/') && <img src={`${postConstants.ossUrl}${post.attachment.filePath}`} style={{ width: '64px', height: '64px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => onOpenModal(`${postConstants.ossUrl}${post.attachment.filePath}`)} />}
                  {post.attachment.mimeType.startsWith('audio/') && <audio controls src={`${postConstants.ossUrl}${post.attachment.filePath}`} />}
                  {!post.attachment.mimeType.startsWith('image/') && !post.attachment.mimeType.startsWith('audio/') && <a href={`${postConstants.ossUrl}${post.attachment.filePath}`} target="_blank"><FileOpenIcon sx={{ color: 'grey.500', width: '64px', height: '64px' }} /></a>}
                </Box>}
                {post.topicId === commonTopicsConstants.poll.id && <PollComponent propPost={post} />}
              </>}
              
              {/* 画像のみモード */}
              {post.topicId === commonTopicsConstants.imageOnly.id && <>
                <Box component="div" sx={{ mt: 1 }}>
                  <Tooltip title={post.text}>
                    <img src={`${postConstants.ossUrl}${post.attachment.filePath}`} style={{ width: '64px', height: '64px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => onOpenModal(`${postConstants.ossUrl}${post.attachment.filePath}`)} />
                  </Tooltip>
                </Box>
              </>}
              
              <Typography component="div" sx={{ mt: .25 }}>
                <Tooltip title="リプする" placement="top"><IconButton component={Link} to={`/@${post.userId}/posts/${post.id}`} sx={{ mr: .25, color: 'grey.600' }} size="small"><ReplyIcon fontSize="inherit" /></IconButton></Tooltip>
                <FavouriteComponent propPost={post} />
                <EmojiReactionComponent propPost={post} />
              </Typography>
              
              {// リプライ元表示
                !isEmptyString(post.inReplyToPostId) && !isEmptyString(post.inReplyToUserId) && <Box component="div" sx={{ mt: 1, maxHeight: '7.85em', overflowY: 'hidden', border: '1px solid', borderColor: 'grey.600', borderRadius: 1 }}>
                  <BeforeReplyComponent inReplyToPostId={post.inReplyToPostId} inReplyToUserId={post.inReplyToUserId} />
                </Box>
              }
            </>}
          />
        </ListItem>
        <Divider component="li" />
      </Fragment>)}
    </List>
    
    <Modal open={isModalOpen} onClose={onCloseModal} sx={{ '& .MuiBackdrop-root': { cursor: 'pointer' } }}>
      <Box component="div" sx={{ ...modalStyleConstants, p: 0, overflow: 'hidden', maxWidth: '80vw', width: 'auto', textAlign: 'center', cursor: 'pointer' }} onClick={onCloseModal}>
        <img src={modalFilePath} style={{ maxWidth: '78vw', maxHeight: '80vh', verticalAlign: 'top' }} />
      </Box>
    </Modal>
  </>;
};
