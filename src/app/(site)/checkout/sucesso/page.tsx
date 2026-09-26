import type { Metadata } from "next";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <div className="container-k pt-10 md:pt-14">
      <OrderSuccess />
    </div>
  );
}
