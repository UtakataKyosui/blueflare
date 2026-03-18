import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-background">
      <Suspense fallback={<div className="w-full max-w-sm mx-auto" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
