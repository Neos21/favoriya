# Let's Encrypt による証明書取得・更新方法

```bash
$ certbot --nginx -d oss.pseudo.neos21.net
  # $ certbot-auto certonly --webroot -w /var/www/html -d example.neos21.net
  # $ certbot certonly --manual -d example.neos21.net

$ certbot renew
```
