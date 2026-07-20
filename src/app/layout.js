import { Archivo, Fraunces } from "next/font/google";
import SiteAmbient from "@/components/SiteAmbient";
import "./globals.css";

// Enne esimest värvimist: teema (hele/tume) ja raamipreset
// localStorage'ist + data-reveal-ready lipp, mille all scroll-reveal
// elemendid tohivad peidus olla (ilma JS-ita jääb sisu nähtavaks).
const themeBootstrap = `
(() => {
  try {
    const theme = window.localStorage.getItem("ks-theme");
    if (theme === "hele" || theme === "tume") {
      document.documentElement.dataset.theme = theme;
    }
  } catch {
  }
  try {
    const preset = window.localStorage.getItem("ks-frame-preset");
    if (preset === "gold" || preset === "silver" || preset === "bronze") {
      document.documentElement.dataset.framePreset = preset;
    }
  } catch {
  }
  document.documentElement.dataset.revealReady = "true";
})();
`;

const headingFont = Fraunces({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const bodyFont = Archivo({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  metadataBase: new URL("https://kaljosimson.ee"),
  applicationName: "Kaljo Simson",
  title: {
    default: "Kaljo Simson — maalikunstnik",
    template: "%s | Kaljo Simson",
  },
  description:
    "Kaljo Simson oli eesti maalikunstnik, kelle loomingus avaldub eriline sisemine avarus ja isikupärane nägemus.",
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#161217" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      data-scroll-behavior="smooth"
      data-theme="hele"
      data-frame-preset="bronze"
      lang="et"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <SiteAmbient />
        {children}
      </body>
    </html>
  );
}
