import { Suspense } from "react";
import { Modal } from "@/components/modal";
import { LoginForm } from "@/components/login-form";

export default function LoginModal() {
  return (
    <Modal>
      <Suspense fallback={<div className="w-full max-w-sm mx-auto h-[400px]" />}>
        <LoginForm />
      </Suspense>
    </Modal>
  );
}
