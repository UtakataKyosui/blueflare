export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getAuth } from "@/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function DashboardPage() {
  const auth = getAuth()
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login?callbackURL=/dashboard")
  }

  const { user } = session
  const { session: sessionInfo } = session

  return (
    <main className="min-h-svh p-6 flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Section: プロフィール */}
      <section className="flex flex-col gap-4">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          profile
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-14">
                <AvatarFallback
                  className="text-base font-semibold text-white"
                  style={{ backgroundColor: "oklch(0.546 0.245 262.881)" }}
                >
                  {getInitials(user.name ?? user.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="text-lg font-semibold leading-tight">
                  {user.name ?? "—"}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-1">
                  {user.emailVerified ? (
                    <Badge variant="secondary">メール確認済み</Badge>
                  ) : (
                    <Badge variant="outline">未確認</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section: アカウント統計 */}
      <section className="flex flex-col gap-4">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          account
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-xs tracking-wide uppercase text-muted-foreground">
                登録日
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {formatDate(new Date(user.createdAt))}
              </p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-xs tracking-wide uppercase text-muted-foreground">
                メール確認
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.emailVerified ? (
                <Badge variant="secondary">確認済み</Badge>
              ) : (
                <Badge variant="outline">未確認</Badge>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-xs tracking-wide uppercase text-muted-foreground">
                アカウント種別
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">メール / パスワード</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section: アクティブセッション */}
      <section className="flex flex-col gap-4">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          session
        </p>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">セッション開始</p>
                <p className="text-sm font-medium">
                  {formatDateTime(new Date(sessionInfo.createdAt))}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">有効期限</p>
                <p className="text-sm font-medium">
                  {formatDateTime(new Date(sessionInfo.expiresAt))}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">ユーザーエージェント</p>
              <p className="font-mono text-xs text-foreground/70 truncate">
                {sessionInfo.userAgent ?? "—"}
              </p>
            </div>

            {sessionInfo.ipAddress && (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">IPアドレス</p>
                <p className="font-mono text-xs text-foreground/70">
                  {sessionInfo.ipAddress}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section: クイックアクション */}
      <section className="flex flex-col gap-4">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          settings
        </p>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">プロフィール編集</p>
                <p className="text-xs text-muted-foreground">
                  名前・アイコンを変更する
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">準備中</Badge>
                <Button variant="outline" size="sm" disabled>
                  編集
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">セキュリティ設定</p>
                <p className="text-xs text-muted-foreground">
                  パスワード・2段階認証を管理する
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">準備中</Badge>
                <Button variant="outline" size="sm" disabled>
                  設定
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
