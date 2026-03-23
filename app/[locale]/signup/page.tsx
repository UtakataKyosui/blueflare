import { setRequestLocale } from "next-intl/server";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-background">
      <SignupForm />
    </div>
  );
}
