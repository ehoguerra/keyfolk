import type { Metadata } from "next";
import { BuildSteps } from "@/components/home/BuildSteps";
import { Categories } from "@/components/home/Categories";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { Hero } from "@/components/home/Hero";
import { Reviews } from "@/components/home/Reviews";
import { SoundLab } from "@/components/home/SoundLab";
import { JsonLd } from "@/components/seo/JsonLd";
import { DEFAULT_OG_IMAGE, SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Keyfolk — teclados mecânicos custom" },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Keyfolk — teclados mecânicos custom",
    description: SITE.description,
    url: "/",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
          logo: absoluteUrl("/icon.svg"),
          address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
          description: SITE.description,
        }}
      />
      <Hero />
      <FeaturedGrid />
      <SoundLab />
      <Categories />
      <BuildSteps />
      <Reviews />
    </>
  );
}
