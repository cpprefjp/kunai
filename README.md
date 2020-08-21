# Kunai

[cpprefjp](https://cpprefjp.github.io/) と [boostjp](https://boostjp.github.io/) のフロントエンド、強化版

- [x] cpprefjp
- [ ] boostjp （対応予定）

## ビルド

```bash
git submodule update --init
npm install
npm run build
```

## 開発

```bash
npm install
npm run dev
```

http://localhost:8080/


## デバッグ
- コンソールログを有効にする

[`js/kunai.js`](js/kunai.js)で、`DummyLogger`の代わりに`DefaultLogger`を使用する

```js
//this.log = new DefaultLogger()
this.log = new DummyLogger()
```

↓

```js
this.log = new DefaultLogger()
//this.log = new DummyLogger()
```

## 設計思想

- C++のことを調べて知って試すフローをcpprefjp上で完結可能にする
- JavaScriptが無効になっていてもコンテンツ自体は閲覧可能


## コンポーネント

### Kunai (core)

- [x] __cpprefjp/site__ のソースコードとメタ情報の包括管理
- [x] 読み込まれていない状態では従来と同じ機能性
- [x] C++バッジ
- [x] クイックジャンプ ([crsearch](https://github.com/cpprefjp/crsearch))
- [x] サイドバー

### Indexer

- [ ] 特徴語の索引機能
- [ ] タグクラウド

### Yata

- [x] Playground (サンプルコードをその場で実行する機能）
- [x] __cpprefjp/site__ のソースのサンプルコードの段階で C++ の `#include` が足りていないものを検知して自動で追加

---

## ドキュメント

- [Wiki](https://github.com/saki7/kunai/wiki)

## メンテナ

- [@cpprefjp/design]
- [@saki7] ([cpprefjp] design team)

## ライセンス

→ [LICENSE](LICENSE)

[@cpprefjp/design]: https://github.com/orgs/cpprefjp/teams/design
[@saki7]: https://github.com/saki7
[cpprefjp]: https://github.com/cpprefjp

