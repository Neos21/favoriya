import { Repository } from 'typeorm';

import { PostEntity } from '../entities/post.entity';

/** 投稿を取得する系の共通する部分 */
export const postsQueryBuilder = (postsRepository: Repository<PostEntity>, isAfterRepliesMode: boolean = false) => {
  const selectColumns = ['posts.id', 'posts.userId', 'posts.text', 'posts.topicId', 'posts.createdAt'];
  if(!isAfterRepliesMode) selectColumns.push('posts.inReplyToPostId', 'posts.inReplyToUserId');
  
  return postsRepository
    .createQueryBuilder('posts')
    .select(selectColumns)  // 投稿内容 (リプライ取得時はリプライ元を取得しない)
    .leftJoin('posts.user', 'users')  // 投稿に対応する users を結合する
    .addSelect(['users.name', 'users.avatarUrl'])  // 投稿ユーザの情報
    .leftJoin('posts.attachment', 'attachments')  // 投稿に紐付く添付ファイル
    .addSelect(['attachments.id', 'attachments.filePath', 'attachments.mimeType'])
    .leftJoin('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
    .addSelect(['favourites.id'])
    .leftJoin('favourites.favouritedByUser', 'favourited_by_users')  // ふぁぼったユーザ情報
    .addSelect(['favourited_by_users.id', 'favourited_by_users.avatarUrl'])
    .leftJoin('posts.emojiReactions', 'emoji_reactions')  // 投稿に対応する EmojiReactionEntity を結合する
    .addSelect(['emoji_reactions.id', 'emoji_reactions.reactedPostsUserId', 'emoji_reactions.reactedPostId', 'emoji_reactions.userId', 'emoji_reactions.emojiId'])
    .leftJoin('emoji_reactions.emoji', 'emojis')  // EmojiEntity を結合する
    .addSelect(['emojis.id', 'emojis.name', 'emojis.imageUrl'])
    .leftJoin('emoji_reactions.reactionByUser', 'reaction_by_users')  // リアクションしたユーザ情報
    .addSelect(['reaction_by_users.id', 'reaction_by_users.avatarUrl']);
};
