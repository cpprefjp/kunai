# kunai

[cpprefjp](https://cpprefjp.github.io/) と [boostjp](https://boostjp.github.io/) のフロントエンド、強化版

- [x] cpprefjp
- [ ] boostjp （対応予定）

---


## 設計思想 (v1)

- C++のことを調べて知って試すフローをcpprefjp上で完結可能にする
- cpprefjp/site の記事のソース改変ゼロ
- cpprefjp/site_generator の現行アセットを全て ES2017+ / PostCSS 化


---


## コンポーネント

### Compat (v1)

互換性モジュール ([css/kunai/compat.scss](css/kunai/compat.scss))

- [ ] 現行の `cpprefjp/site_generator` のCSSを置換した場合に同じ表示にする
- [x] Bootstrap v3 と干渉しない
- [x] アイコン類はなるべく FontAwesome を使う


### Compat (v2)

将来版

- [ ] Bootstrap -> v4
- [ ] Glyphicon が Bootstrap v4 で deprecate -> FontAwesomeに完全移行


### Kunai (core, v1)

cpprefjp のソースコードとメタ情報の包括管理

- [x] 読み込まれていない状態では従来と同じ機能性
- [x] 現在開いているページのMarkdownソースをGitHubリポジトリからフェッチ、正しく構文解析してメタ情報として使う
- [ ] 最新版ではなくビルドバージョンのmdを取ってくる


### Kunai (core, v2)

将来版

- [ ] 左のツリービューのUX改善 (cpprefjp/site#472)


### Yata

- [x] 全てのサンプルソースにWandboxエディタを動的に追加
- [x] 何も読み込まれていない状態ではこれまでの静的な表示を保つ
- [x] cpprefjp/site のソースのサンプルコードの段階でC++の `#include` が足りていないものを検知して自動で追加


---


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
    <title>Kunai - sample setup</title>
    <link href="kunai/css/font-awesome.css" rel="stylesheet">
    <link href="kunai/css/codemirror.css" rel="stylesheet">
    <link href="kunai/css/kunai.css" rel="stylesheet">

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

