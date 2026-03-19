# Blueflare (AI Voice Diary)

Blueflare は、音声入力機能を活用した日記（AI Voice Diary）アプリケーションです。
ブラウザの **Web Speech API** を用いて話した内容を瞬時に文字起こしし、**Cloudflare Workers AI** を使って感情分析や、AIからのパーソナライズされた振り返りコメントを自動生成します。

## 主な機能
- 🎙️ **音声入力による簡単な日記記録**: Web Speech API を用いてマイクから直接文字起こし。送信前の手動手直し機能も搭載しています。
- 🤖 **AIによる振り返り**: Cloudflare Workers AI (Llama-3.1-8B等) が、あなたに寄り添った振り返りコメントを日本語で生成します。
- 📊 **感情分析 (Sentiment Analysis)**: 日記の内容に基づくポジティブ・ネガティブの判定などを自動で行い記録します。
- 🔒 **セキュアな認証**: Better Auth によるユーザー登録とログイン機能。
- ☁️ **Cloudflare へのシームレスなデプロイ**: OpenNext を用いて Cloudflare Workers 上にスケーラブルにデプロイされます。データの保存には Cloudflare D1 を使用します。

## アーキテクチャ構成について（ハイブリッドAI処理）

Blueflareは、ユーザー体験（UX）とサーバー負荷を最適化するため、強力な**ハイブリッドAI構成**を採用しています。

- **Web Speech API（フロントエンド）**: 音声のリアルタイム文字起こしはブラウザの標準機能を活用することで、ゼロ遅延・ゼロ通信コストを実現しています。
- **Transformers.js（フロントエンド）**: 感情判定などの軽量なAI処理は、初回ロード後にブラウザのローカル（Web Worker）で推論を行い、サーバーコストを節約します。
- **Cloudflare Workers AI（バックエンド）**: 数GBの強力なLLM（Llama 3等）を利用する「日記の振り返り」処理は、ユーザー端末のスペックに依存せず快適なレスポンスを返すため、エッジサーバー側で処理させています。

## 技術スタック
- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: OpenNext, Cloudflare Workers (Edge runtime)
- **Database**: Cloudflare D1 (Drizzle ORM)
- **AI Models**: Cloudflare Workers AI (`@cf/huggingface/distilbert-sst-2-int8`, `@cf/meta/llama-3.1-8b-instruct`)
- **Authentication**: Better Auth

## 開発環境のセットアップ

### インストール
```bash
bun install
```

### データベースと環境変数の設定
`.env.local` または `.dev.vars` に必要な認証用シークレットなどを設定し、データベース（Cloudflare D1）を構成してください。

### プレビュー環境の起動
OpenNext のビルドプロセスと Cloudflare のバインディングモック（wrangler dev）を統合したプレビュー用コマンドを実行します。
```bash
bun run preview
```
実行後、`http://127.0.0.1:8787` にアクセスして動作を確認できます。

---

## Cloudflare Workers AI の料金について (2026年時点)

当プロジェクトでは、感情分析や日記の振り返り機能に **Cloudflare Workers AI** を利用しています。
利用にあたり、以下の料金体系にご留意ください。

- **課金単位**: AIモデルの実行には「ニューロン (Neurons)」という単位が消費されます。
- **無料枠**: 1日あたり **10,000 ニューロン** まで完全に無料で利用できます。
- **個人利用の目安**: 個人向けの日記アプリ（1日数十回のテキスト生成・感情分析）であれば、この1万ニューロンの無料枠内に余裕で収まるため、**実質無料**で運用可能です。
- **無料枠の超過**: 無料枠（1万ニューロン）を超えて利用する場合、Cloudflareの有料プラン（Workers Paid: 月額$5〜）への加入が必要です。有料プラン加入時の超過分は「1,000 ニューロンあたり 約 $0.011（約1.5円）」の従量課金となります。
- **安全な設計**: 有料プラン未加入の場合、1日の無料枠に達すると自動的にリクエストが制限されるため、意図しない高額請求が発生する心配はありません。

---

## トラブルシューティング

### `pnpm run deploy` が何も表示せずハングする

**症状**: デプロイコマンドを実行すると `OpenNext — Cloudflare deploy` のヘッダーが表示された後、何も出力されずプロセスが止まる。

**原因**: `@opennextjs/cloudflare` の deploy フェーズは内部で `wrangler` の `getPlatformProxy()` を呼び出し、Node.js IPC (プロセス間通信) で workerd と通信する。このプロジェクトではビルドを **Bun** で実行しているが、**Bun の Node.js 互換実装では wrangler の workerd IPC が正常に動作せずハングする**。

**なぜ Bun を使っているのか**: Node.js v22+ は `cpSync` を virtiofs マウント上で実行すると失敗するバグがある。Bun は独自の fs 実装を持つためこのバグを回避できる。ただしこれは **build フェーズのみの問題**。

**解決策**: `scripts/opennext.sh` で build と deploy を使い分ける。

```sh
case "$1" in
  deploy|populateCache)
    exec "$NODE" "$CLI" "$@"   # deploy は Node.js
    ;;
  *)
    exec "$BUN" run "$CLI" "$@"  # build は Bun
    ;;
esac
```

このプロジェクトの `scripts/opennext.sh` は既にこの分岐を実装済み。

**デバッグ方法**: ハング中に `ps aux | grep "bun\|wrangler\|workerd"` を実行すると、Bun プロセスと複数の workerd プロセスが起動したまま止まっている状態が確認できる（wrangler CLI プロセスは存在しない）。これが `getPlatformProxy` でのハングのサインとなる。

### `pnpm run preview` でローカル環境が起動しない / AI 機能がハングする

**症状**: `wrangler dev`（ローカルモード）でプレビューを起動すると、AI 関連の処理でハングするか、Cloudflare Workers AI の呼び出しが失敗する。

**原因**: `wrangler.jsonc` の AI バインディングに `"remote": true` が設定されている。`wrangler dev` をローカルモード（`--remote` なし）で起動すると、miniflare がこのリモート AI バインディングをローカルでシミュレートしようとするが、ローカルで Cloudflare Workers AI を再現することはできないためハングや失敗が発生する。

```jsonc
// wrangler.jsonc
"ai": {
    "binding": "AI",
    "remote": true   // ← ローカルモードでは扱えない
}
```

**解決策**: `wrangler dev` に `--remote` フラグを付けて起動する。これにより D1・R2・AI を含むすべてのバインディングが実際の Cloudflare リソースに接続され、ローカル環境でも本番同様に動作する。

```bash
# package.json の preview スクリプト（対策済み）
"preview": "sh scripts/opennext.sh build && bunx wrangler dev --ip 0.0.0.0 --remote"
```

**注意**: `--remote` モードでは実際の Cloudflare リソース（D1 データベース、R2 バケット、Workers AI）を使用するため、Workers AI のニューロン消費や D1 への書き込みが本番環境に影響する点に注意すること。
