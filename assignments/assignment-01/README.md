# Assignment 01: 履修ワークツリーAI

## Student

- 山中 陸久
- a8124222@gsuite.si.aoyama.ac.jp

## Public URL

https://rishu-worktree-ai-vercel-deploy.vercel.app

## Overview

青山学院大学社会情報学部の履修登録時に、授業同士のつながり、研究室・進路との関係、4年間の履修見通しを可視化するMVPです。

主な機能:

- 授業ワークツリー表示
- 目標ルート選択
- 取得済み授業の切り替え
- 履修条件・次に埋める授業の表示
- AI相談パネル風の履修理由説明
- 4年間の履修見通し表示

## Contents

- `rishu-worktree-ai/`: React/Vite prototype source
- `rishu-worktree-ai/dist/`: built static files
- `url.txt`: public deployment URL

## Run Locally

```powershell
cd assignments/assignment-01/rishu-worktree-ai
corepack pnpm install
corepack pnpm dev
```

## Build Check

The submitted build was verified with:

```powershell
corepack pnpm build
```

The Vercel deployment was also checked for:

- top page HTTP 200
- title: `履修ワークツリーAI`
- JavaScript asset HTTP 200
- CSS asset HTTP 200
