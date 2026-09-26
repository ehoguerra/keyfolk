import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = {
  title: "Carrinho",
  alternates: { canonical: "/carrinho" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="container-k pt-10 md:pt-14">
      <CartPageView />
    </div>
  );
}
