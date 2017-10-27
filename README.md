# kunai

[cpprefjp](https://cpprefjp.github.io/) と [boostjp](https://boostjp.github.io/) のフロントエンド、強化版

- [x] cpprefjp
- [ ] boostjp （対応予定）

---


## 設計思想 (v1)

- C++のことを調べて知って試すフローをcpprefjp上で完結可能にする
- cpprefjp/site の記事のソース改変ゼロ
- cpprefjp/site_generator の現行アセットを全て ES2017+ / PostCSS 化
- JavaScriptが無効になっていてもコンテンツ自体は完全に閲覧できる


## site_generator の todo (v1)

### 全般
- HTMLからCSSを全て消す
- Googleサイト内検索とアナリティクス以外のJSを全て消す
- `onclick=tree_onclick` してる部分を全て消す
- faviconのmanifest.jsonのパスを直す（元からおかしい）
- `glyphicon glyphicon-home` -> `fa fa-fw fa-home`
- `glyphicon glyphicon-time` -> `fa fa-fw fa-clock-o fa-flip-horizontal`
- `glyphicon glyphicon-pencil` -> `fa fa-fw fa-pencil`


### サイドバー

https://github.com/cpprefjp/site_generator/blob/fef73565384008fb47d23f09b6db10f6e212fbdb/cpprefjp/templates/content.html#L15

- `active` をつける処理以外は全て消す（ `display: none` は必要なし）
- `glyphicon` をつけている箇所は全て消す (CSSで自動でつく）


---


## コンポーネント

### Compat (v1)

互換性モジュール ([css/kunai/compat.scss](css/kunai/compat.scss), [js/kunai/compat.js](js/kunai/compat.js))

- [x] 現行の __cpprefjp/site_generator__ のCSSと同じ表示
- [x] *Bootstrap* v3 を自前で読む
- [x] *Bootstrap* v3 と干渉しない
- [x] *Glyphicon* (*Bootstrap* v4 で deprecate) -> *FontAwesome* に移行
- [x] *jQuery* を自前で読む


### Compat (v2)

将来版

- [ ] *Bootstrap* -> v4


### Kunai (core, v1)

__cpprefjp/site__ のソースコードとメタ情報の包括管理

- [x] 読み込まれていない状態では従来と同じ機能性
- [x] 現在開いているページのMarkdownソースをGitHubリポジトリからフェッチ、正しく構文解析してメタ情報として使う
- [ ] 最新版ではなくビルドバージョンのmdを取ってくる


### Kunai (core, v2)

将来版

- [ ] 左のツリービューのUX改善 (cpprefjp/site#472)


### Yata

- [x] 全てのサンプルソースにWandboxエディタを動的に追加
- [x] 何も読み込まれていない状態ではこれまでの静的な表示を保つ
- [x] __cpprefjp/site__ のソースのサンプルコードの段階で C++ の `#include` が足りていないものを検知して自動で追加


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

