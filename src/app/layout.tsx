import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정든밤 주막 | wouldulike",
  description: "우주라이크 × 정든밤 축제 주막 주문",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="stars-sm" aria-hidden="true" />
        <div className="stars-md" aria-hidden="true" />
        <div className="stars-lg" aria-hidden="true" />
        <div className="galaxy-band" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
