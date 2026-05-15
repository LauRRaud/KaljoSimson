import { Cormorant_Garamond, Manrope } from "next/font/google";
import PwaRegistration from "@/components/PwaRegistration";
import SiteAmbient from "@/components/SiteAmbient";
import "./globals.css";

const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL("https://beyondframes.net"),
  applicationName: "BeyondFrames",
  manifest: "/manifest.webmanifest",
  title: {
    default: "BeyondFrames",
    template: "%s | BeyondFrames",
  },
  description:
    "A minimalist and refined web gallery for presenting contemporary painters and their works.",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BeyondFrames",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#16130f" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      data-scroll-behavior="smooth"
      data-theme="light"
      lang="et"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <PwaRegistration />
        <SiteAmbient />
        {children}
      </body>
    </html>
  );
}
