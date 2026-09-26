import type { ReactNode } from "react";
import { StoreHydrator } from "../app/StoreHydrator";
import { Toaster } from "../app/Toaster";
import { CartDrawer } from "../cart/CartDrawer";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header, footer, cart drawer and toasts shared by every storefront page (and the 404). */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <StoreHydrator />
      <SiteHeader />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <Toaster />
    </>
  );
}
