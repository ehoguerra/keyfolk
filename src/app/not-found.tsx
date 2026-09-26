import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "@/components/layout/SiteChrome";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="container-k flex flex-col items-start gap-8 pt-16 md:pt-24" aria-labelledby="nf-title">
        <div className={styles.keys} aria-hidden="true">
          <span className={`${styles.key} ${styles.mod}`}>4</span>
          <span className={`${styles.key} ${styles.accent}`}>0</span>
          <span className={`${styles.key} ${styles.alpha}`}>4</span>
        </div>
        <div>
          <h1 id="nf-title" className="display max-w-[14ch] text-[clamp(2.75rem,6.5vw,5.5rem)]">
            Essa tecla não está no layout.
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg text-muted">
            O endereço pode ter mudado ou nunca existiu. Confira se digitou certo, ou volte para um lugar que a gente conhece bem.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary btn-lg">
            Voltar ao início
          </Link>
          <Link href="/loja" className="btn btn-lg">
            Ver a loja
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
