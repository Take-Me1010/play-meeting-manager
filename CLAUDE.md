# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

デュエルマスターズの対戦を管理するGoogle Apps Script + Reactアプリケーション。スプレッドシートをデータストアとして使用し、対戦の組み合わせ・勝敗報告を管理する。

## Commands

```bash
# 全体ビルド (backend dts生成 → backend → frontend)
pnpm build

# 個別ビルド
pnpm build:frontend    # frontend のみ
pnpm build:backend     # backend のみ
pnpm gen-dts           # backend の型定義を frontend に生成

# 開発サーバー
pnpm dev:frontend      # Vite dev server (http://127.0.0.1:5173)
pnpm dev:server        # Express mock server (http://127.0.0.1:3001)

# デプロイ
pnpm clasp:push            # clasp push (dist/ → GAS)

# Lint
pnpm --filter frontend lint
```

## Architecture

### Monorepo Structure (pnpm workspace)

- `frontend/` - React SPA (MUI, react-router-dom)
- `backend/` - Google Apps Script (TypeScript → esbuild)
- `dev-server/` - Express mock API server for local development

### Build Pipeline

両パッケージのビルド成果物は `dist/` に集約され、clasp でデプロイ:
- frontend: `vite-plugin-singlefile` で単一HTMLに結合 → `dist/index.html`
- backend: `esbuild-gas-plugin` でGAS形式に変換 → `dist/main.js`

### Backend (GAS)

- Entry: `backend/src/main.ts` - global 関数を登録
- `controller/` - API関数群 (`doGet`, `userController`, `matchController`)
- `repogitory/` - スプレッドシート操作
- `spreadsheet/` - シート初期化・取得ユーティリティ
- `entity/` - 型定義 (`User`, `Match`)

global関数は `google-script-dts-generator` で型定義を生成し、frontend から参照可能。

### Frontend (React)

- `src/App.tsx` - HashRouter によるルーティング、認証ガード
- `src/pages/` - 各画面コンポーネント
- `src/contexts/AuthContext.tsx` - 認証状態管理
- `src/components/DevPanel.tsx` - 開発用パネル
- `src/@types/` - backend から生成された型定義

GAS環境では `google.script.run` 経由でbackend関数を呼び出し、開発時は `dev-server` のREST APIを使用。

### Data Model (Spreadsheet)

```
users: id, name, email, role
matches: id, round, finished
match_opponents: match_id, user_id (1:2 relation)
match_results: match_id, winner_user_id, finished
```
