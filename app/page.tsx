import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs hover:bg-muted">
            ログイン
          </Link>
          <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80">
            新規登録
          </Link>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
