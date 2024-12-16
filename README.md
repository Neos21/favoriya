<h1 align="center"><a href="https://pseudo.neos21.net" target="_blank" title="Powered By AI">Favoriya</a></h1>

<h2 align="center"><a href="https://github.com/Neos21/pseudo/wiki" target="_blank">More Info (Wiki)</a></h2>

<p align="right">
  <a href="https://ghloc.vercel.app/Neos21/pseudo" target="_blank"><img src="https://img.shields.io/endpoint?color=blue&url=https://ghloc.vercel.app/api/neos21/pseudo/badge" alt="Lines of Code" title="Lines of Code"></a>
</p>


-----


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
