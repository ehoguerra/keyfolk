import Link from "next/link";
import { ColorwayPicker } from "../colorway/ColorwayPicker";
import { Icon } from "../ui/Icon";
import { HeroStage } from "./HeroStage";
import styles from "./Hero.module.css";
import { SoundToggle } from "./SoundToggle";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className={`container-k ${styles.hero}`}>
      <h1 id="hero-title" className={`display ${styles.title}`}>
        <span className="hero-line">Teclados que</span>
        <span className="hero-line">dão vontade</span>
        <span className="hero-line">de digitar.</span>
      </h1>

      <div className={styles.stageWrap}>
        <HeroStage />
      </div>

      <div className={`hero-fade ${styles.hint}`}>
        <p className="ui flex items-center gap-2.5 text-[0.9375rem] text-muted">
          <Icon name="keyboard" size={20} className="shrink-0" />
          <span className="hint-keys">Digite qualquer coisa — o teclado responde.</span>
          <span className="hint-touch">Toque nas teclas — o teclado responde.</span>
        </p>
        <SoundToggle />
      </div>

      <div className={`hero-fade ${styles.aside}`}>
        <p className="max-w-[34ch] text-[1.0625rem] leading-relaxed text-muted">
          Teclados mecânicos custom, montados à mão em São Paulo. Escolha um colorway e veja o teclado, e a loja inteira,
          mudar de cor.
        </p>
        <ColorwayPicker />
        <div className="flex flex-wrap gap-3">
          <Link href="/produto/folk-75" className="btn btn-primary btn-lg">
            Montar o meu
          </Link>
          <Link href="/loja" className="btn btn-lg">
            Ver a loja
          </Link>
        </div>
      </div>
    </section>
  );
}
