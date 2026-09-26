import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    title: "Case",
    text: "Alumínio usinado em CNC, anodizado e conferido contra a luz. Sem risco, sem rebarba, sem folga no encaixe.",
  },
  {
    title: "Placa & gasket",
    text: "A placa de FR4 repousa sobre tiras de poron. É isso que deixa a digitação macia e o som abafado, sem eco.",
  },
  {
    title: "Switches",
    text: "Lubrificados à mão, um por um: Krytox 205g0 nos lineares, óleo fino nos táteis para não apagar o degrau.",
  },
  {
    title: "Caps",
    text: "PBT dye-sub no perfil Cherry. A legenda está dentro do plástico: não desbota e não ganha brilho.",
  },
];

export function BuildSteps() {
  return (
    <section aria-labelledby="como-montamos" className="container-k mt-24 md:mt-36">
      <SectionHeading
        id="como-montamos"
        title="Como montamos"
        aside="Quatro etapas, uma bancada e nenhuma pressa. Cada teclado sai daqui testado tecla por tecla."
      />
      <ol className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative flex flex-col gap-4 border-t border-line-strong pt-6">
            <span
              aria-hidden="true"
              className="ui grid h-12 w-12 place-items-center rounded-[12px] bg-alpha text-lg text-alpha-legend shadow-[inset_0_-5px_0_rgb(0_0_0/0.12),0_6px_14px_-8px_var(--shadow-color)] ring-1 ring-line"
            >
              {i + 1}
            </span>
            <h3 className="display text-[1.75rem]">
              <span className="sr-only">Etapa {i + 1}: </span>
              {s.title}
            </h3>
            <p className="max-w-[34ch] text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
