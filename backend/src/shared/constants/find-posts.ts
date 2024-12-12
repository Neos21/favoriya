/** Select するカラム定義 */
export const selectColumns = [
  'posts.id', 'posts.userId', 'posts.text', 'posts.favouritesCount', 'posts.createdAt',  // 投稿内容
  'users.name', 'users.avatarUrl',  // 投稿ユーザの情報
  'favourites.userId', 'favourited_users.avatarUrl'  // ふぁぼられの情報
];
