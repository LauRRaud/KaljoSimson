/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Admin-vorm on Server Action. Kui saiti serveeritakse otse pordilt :8081
    // (proxy eemaldab x-forwarded-host'ist pordi), ei kattu origin host'iga ja
    // Next katkestab action'i. Lubame need päritolud selgesõnaliselt.
    serverActions: {
      allowedOrigins: [
        "217.146.72.147:8081",
        "217.146.72.147",
        "kaljosimson.ee",
        "www.kaljosimson.ee",
      ],
    },
  },
};

export default nextConfig;
