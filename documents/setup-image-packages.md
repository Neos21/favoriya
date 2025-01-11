# sharp・text2png・node-canvas あたりのインストールに失敗する場合


## sharp

```bash
$ apt install -y libvips-dev

$ npm install -S build-from-source sharp
$ npm install -S --arch=x64 --platform=linux sharp
```

## text2png

```bash
$ apt update
$ apt install -y build-essential libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev
$ brew install pkg-config cairo pango libpng jpeg giflib

$ npm install -S --build-from-source text2png
```
