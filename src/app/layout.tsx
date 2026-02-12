import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ဒေါက်တာထွန်းမြတ်ဝင်း ကလိန်း - အွန်လိုင်းဆွေးနွေးခြင်း",
  description: "အမျိုးသားကျန်းမာရေးနှင့် အာရုံကြောစနစ်ပြဿနာများအတွက် ပညာရှင်အွန်လိုင်းဆွေးနွေးခြင်းများ။ ယနေ့ချိန်းဆိုပါ။",
  keywords: "ဆရာဝန်၊ ဆွေးနွေးခြင်း၊ အမျိုးသားကျန်းမာရေး၊ မျိုးဆက်ရေး၊ နှလုံးရောဂါ၊ အွန်လိုင်းဆရာဝန်၊ မြန်မာ",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="font-myanmar antialiased"
        style={{ fontFamily: "'Pyidaungsu', 'Myanmar Text', 'Noto Sans Myanmar', sans-serif" }}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
