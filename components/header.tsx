"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useTranslations } from "next-intl";

export function Header() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const t = useTranslations("header");

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-medium text-sm">
          App
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <LanguageToggle />
          {isPending ? (
            <span className="text-muted-foreground text-xs">{t("loading")}</span>
          ) : session ? (
            <>
              <span className="text-muted-foreground">{session.user.name}</span>
              <span className="text-muted-foreground text-xs">
                {session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex h-7 items-center justify-center rounded-md border border-border px-2.5 text-xs font-medium hover:bg-muted"
              >
                {t("signOut")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-7 items-center justify-center rounded-md border border-border px-2.5 text-xs font-medium hover:bg-muted"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-7 items-center justify-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/80"
              >
                {t("signUp")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
