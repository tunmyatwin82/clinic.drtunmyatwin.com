import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/LanguageContext";
import { AuthCookieSync } from "@/components/auth-cookie-sync";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ဒေါက်တာထွန်းမြတ်ဝင်း ကလိန်း - အွန်လိုင်းဆွေးနွေးခြင်း",
  description:
    "သိုင်းရိုက်ရောဂါများအတွက် အထူးကု ဒေါက်တာထွန်းမြတ်ဝင်း — အွန်လိုင်းဆွေးနွေးမှု ချိန်းဆိုပါ။",
  keywords:
    "ဆရာဝန်၊ ဆွေးနွေးခြင်း၊ သိုင်းရိုက်၊ thyroid၊ အွန်လိုင်းဆရာဝန်၊ မြန်မာ",
  authors: [{ name: "ဒေါက်တာထွန်းမြတ်ဝင်း" }],
  openGraph: {
    title: "ဒေါက်တာထွန်းမြတ်ဝင်း ကလိန်း",
    description: "ပညာရှင်အွန်လိုင်းကျန်းမာရေးဆွေးနွေးခြင်း",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Padauk:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-myanmar antialiased"
        style={{
          fontFamily:
            "'Padauk', 'Pyidaungsu', 'Myanmar Text', 'Noto Sans Myanmar', sans-serif",
        }}
      >
        <LanguageProvider>
          <AuthCookieSync />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
