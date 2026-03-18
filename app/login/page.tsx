"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function getSafeCallbackURL(raw: string | null): string {
  if (!raw) return "/";
  // Must start with / but not // (protocol-relative URL)
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = getSafeCallbackURL(searchParams.get("callbackURL"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL,
      });

      if (error) {
        setError(error.message ?? "ログインに失敗しました");
        return;
      }

      router.push(callbackURL);
    } catch {
      setError("予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center p-6" />}>
      <LoginForm />
    </Suspense>
  );
}
