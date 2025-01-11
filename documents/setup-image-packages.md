# sharp・node-canvas あたりのインストールに失敗する場合

| brew     | apt                               |
|----------|-----------------------------------|
| vips     | libvips libvips-tools libvips-dev |
| libheif  | libheif-dev                       |
| libde265 | libde265-dev                      |
| x265     | x265                              |

```bash
$ apt install -y libvips libvips-tools libvips-dev libheif-dev libde265-dev x265
$ apt install -y build-essential libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev libglib2.0-dev

$ npm install --build-from-source sharp
```

- https://github.com/libvips/libvips/wiki/Build-for-Ubuntu
- https://github.com/strukturag/libheif/issues/21#issuecomment-552252382
- https://zenn.dev/tocat/articles/00ff1bbdee1c58
