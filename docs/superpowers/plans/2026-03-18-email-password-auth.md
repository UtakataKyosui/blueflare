# Email + Password Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BetterAuth を使った Email + Password ログイン/サインアップ機能を実装する（`/login`, `/signup` 専用ページ、ログイン後は元のページへリダイレクト）

**Architecture:** BetterAuth CLI でDrizzle SQLiteスキーマを自動生成し、D1マイグレーションを適用する。`/login` と `/signup` はクライアントコンポーネントで、BetterAuth クライアント (`signIn.email`, `signUp.email`) を直接呼び出す。

**Tech Stack:** Next.js 15 (App Router), BetterAuth v1.5.5, Drizzle ORM + Cloudflare D1 (SQLite), Tailwind CSS v4, shadcn/ui

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `drizzle.config.ts` | dialect を `sqlite` に修正、migrations 出力先を追加 |
| Generate | `db/schema.ts` | BetterAuth CLI が生成するテーブル定義（user, session, account, verification） |
| Create | `db/migrations/` | drizzle-kit generate で生成されるSQLマイグレーションファイル |
| Create | `app/login/page.tsx` | ログインフォームページ（クライアントコンポーネント） |
| Create | `app/signup/page.tsx` | サインアップフォームページ（クライアントコンポーネント） |

---

## Task 1: drizzle.config.ts を SQLite 用に修正

**Files:**
- Modify: `drizzle.config.ts`

現状は `dialect: "postgresql"` になっているが、D1 は SQLite のため修正が必要。

- [ ] **Step 1: drizzle.config.ts を修正**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",
  out: "./db/migrations",
});
```

- [ ] **Step 2: 動作確認（型チェック）**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add drizzle.config.ts
git commit -m "fix: drizzle config dialectをsqliteに修正"
```

---

## Task 2: BetterAuth CLI でスキーマ生成

**Files:**
- Generate/Overwrite: `db/schema.ts`

BetterAuth CLI が `auth.ts` を読み込み、必要なテーブル定義を `db/schema.ts` に出力する。

- [ ] **Step 1: BetterAuth CLI でスキーマ生成**

```bash
npx @better-auth/cli generate --config auth.ts --output db/schema.ts
```

> **Note:** プロンプトが出た場合は `yes` で上書き。生成されるテーブル: `user`, `session`, `account`, `verification`

- [ ] **Step 2: 生成されたスキーマを確認**

`db/schema.ts` を開いて、以下の4テーブルが存在することを確認:
- `user` (id, name, email, emailVerified, image, createdAt, updatedAt)
- `session` (id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId)
- `account` (id, accountId, providerId, userId, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt)
- `verification` (id, identifier, value, expiresAt, createdAt, updatedAt)

- [ ] **Step 3: Commit**

```bash
git add db/schema.ts
git commit -m "feat: BetterAuth CLIでDrizzle SQLiteスキーマを生成"
```

---

## Task 3: Drizzle マイグレーション生成 & D1 に適用

**Files:**
- Create: `db/migrations/` (drizzle-kit が自動生成)

- [ ] **Step 1: マイグレーションファイルを生成**

```bash
npx drizzle-kit generate
```

Expected: `db/migrations/0000_*.sql` のようなファイルが生成される

- [ ] **Step 2: ローカル D1 にマイグレーションを適用**

```bash
npx wrangler d1 migrations apply blueflare-d1 --local
```

Expected:
```
✅ Applied 1 migration to the local D1 database.
```

- [ ] **Step 3: Commit**

```bash
git add db/migrations/
git commit -m "feat: BetterAuth用テーブルのマイグレーションを追加"
```

---

## Task 4: `/login` ページの実装

**Files:**
- Create: `app/login/page.tsx`

BetterAuth クライアントの `signIn.email()` を使ったログインフォーム。`callbackURL` で元のページに戻る。

- [ ] **Step 1: app/login/page.tsx を作成**

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn.email({
      email,
      password,
      callbackURL,
    });

    if (error) {
      setError(error.message ?? "ログインに失敗しました");
      setLoading(false);
      return;
    }

    router.push(callbackURL);
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">ログイン</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="underline underline-offset-4">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ローカル dev サーバーで動作確認**

```bash
npm run dev
```

ブラウザで `http://localhost:3000/login` を開き:
- フォームが表示されること
- 存在しないメールでログインするとエラーが表示されること

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: ログインページを実装"
```

---

## Task 5: `/signup` ページの実装

**Files:**
- Create: `app/signup/page.tsx`

BetterAuth クライアントの `signUp.email()` を使ったサインアップフォーム。

- [ ] **Step 1: app/signup/page.tsx を作成**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      setError(error.message ?? "登録に失敗しました");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">新規登録</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              名前
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "登録中..." : "登録する"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="underline underline-offset-4">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ローカル dev サーバーで動作確認**

ブラウザで `http://localhost:3000/signup` を開き:
- フォームが表示されること
- テスト用アカウントで登録 → トップページにリダイレクトされること
- 同じメールで再登録するとエラーが表示されること

続けて `/login` でログイン:
- 登録したメールアドレスとパスワードでログインできること

- [ ] **Step 3: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat: サインアップページを実装"
```
