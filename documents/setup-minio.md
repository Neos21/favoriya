# MinIO の環境構築

```bash
$ wget https://dl.min.io/server/minio/release/linux-amd64/minio
$ chmod +x ./minio

$ export MINIO_ROOT_USER=example
$ export MINIO_ROOT_PASSWORD=example-secret
$ export MINIO_SERVER_URL='https://example.neos21.net'
$ export MINIO_BROWSER_REDIRECT_URL='http://127.0.0.1:9001/minio-ui'

$ ./minio server ./oss --console-address ':9001'
  # 管理コンソールには Serveo を経由してアクセスしても良いか
  $ ssh -R 80:localhost:9001 serveo.net
```

- `/etc/nginx/conf.d/example.conf`

```
server {
  listen       80;
  listen       443 ssl;
  server_name  example.neos21.net;
  ssl_certificate      /etc/letsencrypt/live/example.neos21.net/fullchain.pem;
  ssl_certificate_key  /etc/letsencrypt/live/example.neos21.net/privkey.pem;
  include      /etc/letsencrypt/options-ssl-nginx.conf;  # managed by Certbot
  ssl_dhparam  /etc/letsencrypt/ssl-dhparams.pem;        # managed by Certbot
  
  # File Upload Max Size
  client_max_body_size  10M;
  
  # Well Known
  location /.well-known {
    root  /var/www/example;
  }
  
  # Status JSON
  location /status.json {
    root  /var/www/example;
  }
  
  # App
  location / {
    proxy_set_header  Host             $host;
    proxy_set_header  X-Real-IP        $remote_addr;
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_pass  http://127.0.0.1:9000/;
    # WebSocket サポートを有効化
    proxy_http_version  1.1;
    proxy_set_header  Upgrade $http_upgrade;
    proxy_set_header  Connection "upgrade";
  }
  
  # Web UI
  location /minio-ui/ {
    proxy_set_header  Host             $host;
    proxy_set_header  X-Real-IP        $remote_addr;
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    rewrite  ^/minio-ui/(.*)  /$1  break;
    proxy_pass  http://127.0.0.1:9001;
    # WebSocket サポートを有効化
    proxy_http_version  1.1;
    proxy_set_header  Upgrade $http_upgrade;
    proxy_set_header  Connection "upgrade";
  }
}
```

## CLI

```bash
$ curl https://dl.min.io/client/mc/release/linux-amd64/mc -o ./mc
$ chmod +x ./mc
$ ./mc --help

$ ./mc alias set local http://localhost:9000 example example-secret
$ ./mc alias list

# バケット作成
$ ./mc mb ./oss/users/avatar
# バケットを公開状態にする
$ ./mc anonymous set public local/users
```
