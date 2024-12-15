# 匿名ユーザを作る

```sql
psql> INSERT INTO users (id, password_hash, name, role, profile_text, created_at, updated_at) VALUES ('anonymous', '', '匿名さん', 'Anonymous', 'みなさんの投稿を匿名で投稿する Bot です', '2024-12-05 00:00:00.000000', '2024-12-05 00:00:00.000000');
```
