import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Keyfolk — teclados mecânicos custom",
    short_name: "Keyfolk",
    description: SITE.description,
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#D8ECEA",
    theme_color: "#D8ECEA",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
