# 交流会対戦管理アプリ

対戦を手軽にスプレッドシートで管理するシステム

## How to use

- clasp で適当なスプレッドシートのプロジェクトを作成 & 紐づけ & push
- Google Apps Script を Web アプリケーションでデプロイ

## 技術スタック

- React, vite, typescript (./frontend)
- Google Apps Script, esbuild (./backend)

両方で build した結果を ./dist に作成して、clasp からデプロイ（push）を行う

