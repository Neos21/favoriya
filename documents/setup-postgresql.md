# ローカルでの PostgreSQL 環境構築

- WSL : Ubuntu 20.04.6
- OCI : Ubuntu 24.04.1

```bash
# PostgreSQL をインストールする
$ apt install -y postgresql postgresql-contrib
# 状態を確認する
$ systemctl status postgresql

# WSL だと v12・OCI だと v16 がインストールされた
$ psql --version
psql (PostgreSQL) 12.22 (Ubuntu 12.22-0ubuntu0.20.04.1)
$ psql --version
psql (PostgreSQL) 16.6 (Ubuntu 16.6-0ubuntu0.24.04.1)

$ vi /etc/postgresql/12/main/postgresql.conf
$ vi /etc/postgresql/16/main/postgresql.conf 
  listen_address = '*'
  # に変更する

$ vi /etc/postgresql/12/main/pg_hba.conf
$ vi /etc/postgresql/16/main/pg_hba.conf
  # Add
  host    all             all             0.0.0.0/0               md5
  # を最終行に追加する
  # その他 peer の記載は trust に変更する (v16 の場合)
  # また scram-sha-256 は md5 に変更しておく (v16 の場合)

# 一旦再起動する
$ systemctl restart postgresql

# postgres ユーザに切り替えてアクセスできるか確認する
$ sudo -i -u postgres
$ psql
postgres=#

# root ユーザなどでもコレでアクセスできれば trust 設定になっている
$ psql -U postgres
postgres=#
```

## ユーザ・データベースを作成する

```bash
postgres=# CREATE USER my_user WITH PASSWORD 'my_password';
postgres=# CREATE DATABASE my_db;
postgres=# GRANT ALL PRIVILEGES ON DATABASE my_db TO my_user;
postgres=# \q

$ psql -h 127.0.0.1 -p 5432 -U my_user -d my_db
Password for user my_user:  # ココで my_password を入力する
my_user=>
```

## v16 で発生する `QueryFailedError: permission denied for schema public` エラーの対処法

```bash
$ psql -U postgres
postgres=# CREATE SCHEMA AUTHORIZATION my_user;
postgres=# DROP DATABASE my_db;
postgres=# CREATE DATABASE my_db WITH OWNER my_user;
postgres=# GRANT ALL PRIVILEGES ON DATABASE my_db TO my_user;
postgres=# GRANT CREATE ON SCHEMA public TO PUBLIC;
```

- 参考 : [PostgreSQL 15ではpublicスキーマへの書き込みが制限されます | DevelopersIO](https://dev.classmethod.jp/articles/postgresql-15-revoke-create-on-public-schema/)
