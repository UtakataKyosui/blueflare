"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export function SignupForm() {
  const router = useRouter();
  const t = useTranslations("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        setError(
          error.message ??
            `${t("failedError")} (code: ${error.code ?? "unknown"}, status: ${error.status ?? "unknown"})`,
        );
        return;
      }

      // 1. ホームへ遷移 (Parallel Routeのインターセプトを解除するため)
      router.push("/");
      // 2. サーバーサイドの全ステータスを強制リフレッシュ (Cookieの反映を確実にする)
      router.refresh();
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="mb-6 text-2xl font-semibold">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            {t("name")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
          <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? t("submitting") : t("submit")}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" replace className="underline underline-offset-4">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
