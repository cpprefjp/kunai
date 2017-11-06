# Kunai

[cpprefjp](https://cpprefjp.github.io/) と [boostjp](https://boostjp.github.io/) のフロントエンド、強化版

- [x] cpprefjp
- [ ] boostjp （対応予定）

---


## 設計思想

- C++のことを調べて知って試すフローをcpprefjp上で完結可能にする
- __cpprefjp/site__ の記事のソース改変ゼロ
- __cpprefjp/site_generator__ の現行アセットを全て ES2017+ / PostCSS 化
- JavaScriptが無効になっていてもコンテンツ自体は完全に閲覧できる


## コンポーネント

### Site

UX改善アセット

- [x] C++バッジ（ツリービューその他）
- [ ] 今度こそBootstrapを殺す


### Kunai (core)

__cpprefjp/site__ のソースコードとメタ情報の包括管理

- [x] 読み込まれていない状態では従来と同じ機能性
- [x] 現在開いているページのMarkdownソースをGitHubリポジトリからフェッチ、正しく構文解析してメタ情報として使う
- [ ] 最新版ではなくビルドバージョンのmdを取ってくる
- [ ] 左のツリービューのUX改善 (cpprefjp/site#472, cpprefjp#site_generator#28)


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
    <link href="kunai/css/kunai-stage-0.css" rel="stylesheet">
    <link href="kunai/css/kunai-stage-1.css" rel="stylesheet">
    <link href="kunai/css/kunai-stage-2.css" rel="stylesheet">
    <link href="kunai/css/kunai-stage-3.css" rel="stylesheet">

    <script type="text/javascript" src="js/kunai-vendor.js"></script>
    <script type="text/javascript" src="js/kunai.js"></script>

    <script type="text/javascript"><!--
      document.addEventListener('DOMContentLoaded', function() {
        var kn = new Kunai;
        kn.cpprefjp(); // or kn.boostjp();
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

- [Wiki](https://github.com/saki7/kunai/wiki)

## メンテナ

- [@saki7] ([cpprefjp] Member)

## ライセンス

→ [LICENSE](LICENSE)


[@saki7]: https://github.com/saki7
[cpprefjp]: https://github.com/cpprefjp

