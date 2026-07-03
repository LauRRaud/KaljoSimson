import { Cormorant_Garamond, Manrope } from "next/font/google";
import PwaRegistration from "@/components/PwaRegistration";
import SiteAmbient from "@/components/SiteAmbient";
import "./globals.css";

const framePresetBootstrap = `
(() => {
  try {
    const preset = window.localStorage.getItem("beyondframes-frame-preset");
    if (preset === "gold" || preset === "silver" || preset === "bronze") {
      document.documentElement.dataset.framePreset = preset;
    }
  } catch {
  }
  try {
    const theme = window.localStorage.getItem("beyondframes-theme");
    if (theme === "dark" || theme === "light") {
      document.documentElement.dataset.theme = theme;
    }
  } catch {
  }
})();
`;

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
        url: "/favicon.svg?v=black-v2",
        type: "image/svg+xml",
      },
      {
        url: "/icon-192.png?v=black-v2",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.svg?v=black-v2",
    apple: "/apple-touch-icon.png?v=black-v2",
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
      data-frame-preset="silver"
      data-theme="light"
      lang="et"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: framePresetBootstrap }} />
      </head>
      <body>
        <PwaRegistration />
        <SiteAmbient />
        {children}
      </body>
    </html>
  );
}
