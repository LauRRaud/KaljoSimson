export default function manifest() {
  return {
    name: "BeyondFrames",
    short_name: "BeyondFrames",
    description:
      "BeyondFrames is an installable art gallery with artists, framed works and a drawing studio.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    background_color: "#f7f1e8",
    theme_color: "#f7f1e8",
    orientation: "any",
    categories: ["art", "design", "entertainment"],
    lang: "et",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
