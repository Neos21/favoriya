# Favoriya

**[Enter The WebSite](https://pseudo.neos21.net)**


## ローカル実行手順

- WSL2 Ubuntu・OCI Ubuntu にて動作確認済

```bash
# PostgreSQL をセットアップしておく → localhost:5432 で起動しておく

# フロントエンドを起動する → localhost:5173 が起動する
$ cd ./frontend/
$ npm install
$ cp ./.env.example ./.env  # 適宜内容を変更する
$ npm run dev

# MinIO のバイナリをダウンロードしておき実行する → localhost:9000 が起動する
$ ./minio server ./oss --console-address ':9001'

# バックエンドを起動する → localhost:6216 が起動する
$ cd ./backend/
$ npm install
$ cp ./.env.example ./.env  # 適宜内容を変更する
$ npm run dev
```


## Links

- [Neo's World](https://neos21.net)
- [GitHub - Neos21](https://github.com/Neos21)
- [GitHub - Pseudo](https://github.com/Neos21/pseudo)
