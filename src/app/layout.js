import { Cormorant_Garamond, Manrope } from "next/font/google";
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
  title: {
    default: "BeyondFrames",
    template: "%s | BeyondFrames",
  },
  description:
    "A minimalist and refined web gallery for presenting contemporary painters and their works.",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem("beyondframes-theme");
                document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
