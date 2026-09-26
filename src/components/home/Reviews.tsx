import { Rating } from "../ui/Rating";
import { Newsletter } from "./Newsletter";

const REVIEWS = [
  {
    quote: "Montei o Folk 75 numa tarde e o som é absurdo. Parece que eu digito em marshmallow, no bom sentido.",
    name: "Júlia Nakamura",
    city: "Curitiba, PR",
    product: "Folk 75 com switches Creme",
  },
  {
    quote: "O Degrau tem o bump no lugar certo. Programo o dia inteiro e o pulso agradece no fim da sprint.",
    name: "Rafael Andrade",
    city: "Recife, PE",
    product: "Switches Degrau",
  },
  {
    quote: "Comprei o Noturno pelo visual e fiquei pela qualidade do PBT. Seis meses depois, nada de brilho.",
    name: "Bia Souza",
    city: "Belo Horizonte, MG",
    product: "Keycaps Noturno",
  },
];

export function Reviews() {
  return (
    <section aria-labelledby="avaliacoes" className="container-k mt-24 md:mt-36">
      <div className="grid-k gap-y-12">
        <div className="col-span-4 md:col-span-7">
          <h2 id="avaliacoes" className="display text-[clamp(2.25rem,4.6vw,3.5rem)]">
            Quem digita, conta
          </h2>
          <p className="mt-3 flex items-center gap-3 text-muted">
            <Rating value={4.9} />
            <span>média de 1.900 avaliações</span>
          </p>
          <ul className="mt-10 flex flex-col divide-y divide-line border-y border-line">
            {REVIEWS.map((r) => (
              <li key={r.name} className="py-7">
                <figure>
                  <blockquote className="text-xl leading-snug md:text-[1.375rem]">
                    <p>“{r.quote}”</p>
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-muted">
                    <span className="ui text-ink">{r.name}</span>, {r.city}. Comprou {r.product}.
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-4 md:col-span-4 md:col-start-9">
          <Newsletter />
        </div>
      </div>
    </section>
  );
}
