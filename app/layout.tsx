import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "사내 AI 사용 현황 설문",
  description: "사내 AI 사용 현황을 파악하기 위한 익명 설문조사입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans leading-normal antialiased [text-rendering:optimizeLegibility]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
