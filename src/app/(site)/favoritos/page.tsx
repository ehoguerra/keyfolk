import type { Metadata } from "next";
import { FavoritesView } from "@/components/product/FavoritesView";

export const metadata: Metadata = {
  title: "Favoritos",
  alternates: { canonical: "/favoritos" },
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="container-k pt-10 md:pt-14">
      <FavoritesView />
    </div>
  );
}
