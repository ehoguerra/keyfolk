import { CartButton } from "../cart/CartButton";
import { FavoritesLink } from "./FavoritesLink";
import { MobileNav, SearchButton } from "./HeaderActions";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="container-k flex h-16 items-center gap-2 md:h-[72px] md:gap-8">
        <MobileNav />
        <Logo />
        <NavLinks />
        <div className="ml-auto flex items-center gap-0.5 md:gap-1">
          <SearchButton />
          <FavoritesLink />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
