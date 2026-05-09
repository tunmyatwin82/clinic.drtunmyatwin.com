import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import { LanguageProvider } from "@/lib/LanguageContext";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ဒေါက်တာထွန်းမြတ်ဝင်း | အွန်လိုင်းဆွေးနွေးကုသမှု",
  description:
    "အမျိုးသားကျန်းမာရေးနှင့် အာရုံကြောပြဿနာများအတွက် ပညာရှင် အွန်လိုင်းဆွေးနွေးကုသမှု။ လုံခြုံသော ဗီဒီယိုဆွေးနွေးမှု နှင့်ဒစ်ဂျစ်တယ်ဆေးညွှန်း။ ယနေ့ချိန်းဆိုပါ။",
  keywords:
    "ဆရာဝန်၊ အွန်လိုင်းဆွေးနွေးကုသမှု၊ ဗီဒီယိုဆွေးနွေးမှု၊ အမျိုးသားကျန်းမာရေး၊ အာရုံကြော၊ အွန်လိုင်းဆရာဝန်၊ မြန်မာ",
  authors: [{ name: "ဒေါက်တာထွန်းမြတ်ဝင်း" }],
  openGraph: {
    title: "ဒေါက်တာထွန်းမြတ်ဝင်း | အွန်လိုင်းဆွေးနွေးကုသမှု",
    description: "ပညာရှင် အွန်လိုင်းဆွေးနွေးကုသမှု နှင့် ဒစ်ဂျစ်တယ်ကျန်းမာရေး",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{
          fontFamily:
            "var(--font-inter), system-ui, 'Segoe UI', sans-serif",
        }}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
