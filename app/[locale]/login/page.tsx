import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-background">
      <Suspense fallback={<div className="w-full max-w-sm mx-auto" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
