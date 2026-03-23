"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    router.replace(pathname, { locale: locale === "ja" ? "en" : "ja" });
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex h-7 items-center justify-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted"
      aria-label="言語を切り替える"
    >
      {locale === "ja" ? "EN" : "JA"}
    </button>
  );
}
