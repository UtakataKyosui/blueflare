import { Geist_Mono, Noto_Sans } from "next/font/google";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans({ variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blueflare.fill-ayaextech.workers.dev"),
  title: "Blueflare",
  description: "Capture your thoughts and reflections with our AI Voice Diary.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Blueflare - AI Voice Diary",
    description:
      "Speak your mind freely. Let our AI transcribe, analyze your mood, and provide thoughtful reflections.",
    siteName: "Blueflare",
    images: [{ url: "/opengraph-image.png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blueflare - AI Voice Diary",
    description:
      "Speak your mind freely. Let our AI transcribe, analyze your mood, and provide thoughtful reflections.",
    images: ["/twitter-image.png"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ja" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
      )}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__name = window.__name || ((n, f) => f);`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <Header />
            {children}
            {modal}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
