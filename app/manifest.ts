import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wiatlist",
    short_name: "Wiatlist",
    description: "Wspólna lista zakupów dla domowników",
    start_url: "/",
    display: "standalone",
    background_color: "#f5ead8",
    theme_color: "#2f8050",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
