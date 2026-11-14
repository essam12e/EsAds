import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import Motion from "@/components/Motion";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export const metadata: Metadata = {
  title: { default: "أكاديمية المتجر", template: "%s | أكاديمية المتجر" },
  description: "دليلك لبناء متجر ناجح وحملات إعلانية فعّالة: اربط متجرك بالمنصات الإعلانية وأنشئ حملاتك خطوة بخطوة.",
};
export const viewport: Viewport = { themeColor: "#0f1b4d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <WhatsAppWidget />
        <Motion />
      </body>
    </html>
  );
}
