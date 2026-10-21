import type { Metadata, Viewport } from "next";
// Font tự host (chạy offline trong app di động, không phụ thuộc Google Fonts)
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/patrick-hand/400.css";
import "@fontsource/google-sans/400.css";
import "@fontsource/google-sans/500.css";
import "@fontsource/google-sans/600.css";
import "@fontsource/google-sans/700.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import AppShell from "@/components/AppShell";


export const metadata: Metadata = {
  title: "Chinh Phục – Ôn thi như chơi game",
  description: "Ôn thi THPT, đánh giá năng lực (HSA, V-ACT, TSA, SPT) và kiểm tra học kì theo lộ trình cá nhân.",
  applicationName: "Chinh Phục",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Chinh Phục", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }, { url: "/icons/icon-512.png", sizes: "512x512" }], apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3EDDF" },
    { media: "(prefers-color-scheme: dark)", color: "#1B2420" },
  ],
};

// Áp giao diện đã lưu trước khi React chạy để tránh nháy màu
const preTheme = `try{var s=JSON.parse(localStorage.getItem("onthi-state-v1")||"{}");var t=s.theme||{};var r=document.documentElement;if(t.mode&&t.mode!=="auto")r.dataset.theme=t.mode;if(t.accent)r.dataset.accent=t.accent;if(t.font)r.dataset.font=t.font;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preTheme }} />
      </head>
      <body className="font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
