# kunai

[cpprefjp](https://cpprefjp.github.io/) と [boostjp](https://boostjp.github.io/) のJavaScriptフロントエンド

- [x] cpprefjp
- [ ] boostjp （対応予定）

## ビルド

- `npm install`
- `npm run build`

Docker をインストール済みなら:

- `./docker.sh build`
- `./docker.sh install`
- `./docker.sh run build`

## デプロイ

### ファイル類

- `/dist/*`

### html

```html
<!DOCTYPE html>
<html>
  <head>
    <title>CRSearch - sample setup</title>
    <link href="css/font-awesome.css" rel="stylesheet">
    <link href="css/kunai.css" rel="stylesheet">

    <script type="text/javascript" src="js/kunai-vendor.js"></script>
    <script type="text/javascript" src="js/kunai.js"></script>

    <script type="text/javascript"><!--
      document.addEventListener('DOMContentLoaded', function() {
        var kn = new Kunai;
        kn.start();
      });
    --></script>
  </head>
</html>
```

## 開発

- `npm install`
- `npm run dev`
- http://localhost:8080/

Docker をインストール済みなら:

- `./docker.sh build`
- `./docker.sh install`
- `./docker.sh run dev`
- http://localhost:8080/

## ドキュメント

- [Wiki](https://github.com/cpprefjp/kunai/wiki)

## ライセンス

→ [LICENSE](LICENSE)

