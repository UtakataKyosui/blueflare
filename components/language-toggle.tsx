"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("header");

  const toggle = () => {
    const queryString = searchParams.toString();
    const hash =
      typeof window !== "undefined" && window.location.hash
        ? window.location.hash
        : "";
    const href = (queryString ? `${pathname}?${queryString}` : pathname) + hash;
    router.replace(href, { locale: locale === "ja" ? "en" : "ja" });
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex h-7 items-center justify-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted"
      aria-label={t("toggleLanguage")}
    >
      {locale === "ja" ? "EN" : "JA"}
    </button>
  );
}
