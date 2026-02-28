# 交流会対戦管理アプリ

対戦を手軽にスプレッドシートで管理するシステム

## How to use

- clasp で適当なスプレッドシートのプロジェクトを作成 & 紐づけ & push
- Google Apps Script を Web アプリケーションでデプロイ

## 技術スタック

- React, vite, typescript (./frontend)
- Google Apps Script, esbuild (./backend)

両方で build した結果を ./dist に作成して、clasp からデプロイ（push）を行う

## 開発

ローカルサーバー起動:
```bash
# dev server by vite
pnpm dev:frontend
# mock server
pnpm dev:server
```

build and push:
```bash
# 全体ビルド (backend dts生成 → backend → frontend)
pnpm build

# 個別ビルド
pnpm build:frontend    # frontend のみ
pnpm build:backend     # backend のみ
pnpm gen-dts           # backend の型定義を frontend に生成

# push via clasp
pnpm clasp:push
```

