import { setRequestLocale } from "next-intl/server";
import { DiaryDashboard } from "@/components/diary-dashboard";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] pointer-events-none -z-10" />
      <DiaryDashboard />
    </main>
  );
}
