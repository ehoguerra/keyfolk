import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { COLORWAY_BOOT_SCRIPT, DEFAULT_COLORWAY } from "@/lib/colorways";
import { SITE } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Keyfolk — teclados mecânicos custom",
    template: "%s — Keyfolk",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["teclado mecânico", "keycaps", "switches", "custom keyboard", "PBT", "gasket mount", "deskmat"],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#D8ECEA",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-colorway={DEFAULT_COLORWAY} className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: COLORWAY_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
