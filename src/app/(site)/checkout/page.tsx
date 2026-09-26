import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize seu pedido na Keyfolk: contato, endereço, entrega e pagamento em Pix, cartão ou boleto.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <div className="container-k pt-10 md:pt-14">
      <CheckoutForm />
    </div>
  );
}
