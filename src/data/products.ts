import type { ColorwayId } from "@/lib/colorways";

export type Category = "teclados" | "keycaps" | "switches" | "deskmats" | "acessorios";
export type SwitchType = "linear" | "tatil" | "clicky";
export type KeyboardLayoutId = "75" | "65" | "tkl" | "40-orto";

export const CATEGORY_LABEL: Record<Category, string> = {
  teclados: "Teclados",
  keycaps: "Keycaps",
  switches: "Switches",
  deskmats: "Deskmats",
  acessorios: "Acessórios",
};

export const SWITCH_TYPE_LABEL: Record<SwitchType, string> = {
  linear: "Linear",
  tatil: "Tátil",
  clicky: "Clicky",
};

export const LAYOUT_LABEL: Record<KeyboardLayoutId, string> = {
  "75": "75%",
  "65": "65%",
  tkl: "TKL",
  "40-orto": "40% ortolinear",
};

export type ProductStatus =
  | { kind: "in-stock" }
  | { kind: "low-stock"; left: number }
  | { kind: "preorder"; label: string }
  | { kind: "sold-out" };

/** Procedural 3D model description, shared by the viewer and the render route. */
export type ModelSpec =
  | { kind: "keyboard"; layout: KeyboardLayoutId }
  | { kind: "keycaps"; colorway: ColorwayId }
  | { kind: "switch"; switchType: SwitchType; stem: string; top: string; bottom: string }
  | { kind: "deskmat"; pattern: "topografia" | "grade"; base: string; ink: string; accent: string }
  | { kind: "cable"; sleeve: string; connector: string };

export interface CaseOption {
  id: string;
  name: string;
  hex: string;
  /** Keycap set dressed on the render for this case. */
  capset: ColorwayId;
}

export interface SwitchOption {
  id: string;
  name: string;
  detail: string;
  priceDelta: number;
  soldOut?: boolean;
}

export interface PackOption {
  id: string;
  name: string;
  price: number;
}

export interface ProductOptions {
  cases?: CaseOption[];
  switches?: SwitchOption[];
  packs?: PackOption[];
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAtPrice?: number;
  tagline: string;
  description: string[];
  specs: Spec[];
  status: ProductStatus;
  featured: boolean;
  rating: number;
  reviewCount: number;
  /** ISO date, used by the "Novidades" sort. */
  releasedAt: string;
  layout?: KeyboardLayoutId;
  switchType?: SwitchType;
  options: ProductOptions;
  model: ModelSpec;
  /** Pre-rendered images (public/renders), default first. */
  render: string;
  alt: string;
  related: string[];
}

const KEYBOARD_SWITCHES: SwitchOption[] = [
  { id: "creme", name: "Creme", detail: "linear, 45 g", priceDelta: 0 },
  { id: "degrau", name: "Degrau", detail: "tátil, 62 g", priceDelta: 20 },
  { id: "estalo", name: "Estalo", detail: "clicky, 60 g", priceDelta: 0, soldOut: true },
  { id: "sem", name: "Sem switches", detail: "barebones", priceDelta: -190 },
];

export const CASES = {
  laguna: { id: "laguna", name: "Laguna", hex: "#A9CFCB", capset: "laguna" },
  grafite: { id: "grafite", name: "Grafite", hex: "#50535B", capset: "noturno" },
  prata: { id: "prata", name: "Prata", hex: "#C8CBCE", capset: "sinal" },
  mochi: { id: "mochi", name: "Mochi", hex: "#EEC8D1", capset: "mochi" },
  matcha: { id: "matcha", name: "Matcha", hex: "#BCC9A0", capset: "matcha" },
} satisfies Record<string, CaseOption>;

const KEYCAP_SPECS = (extra: Spec[] = []): Spec[] => [
  { label: "Material", value: "PBT de 1,5 mm" },
  { label: "Legendas", value: "Dye-sublimation (não desbotam)" },
  { label: "Perfil", value: "Cherry" },
  { label: "Teclas", value: "158, com extras ABNT2 (Ç, ~ ^, / ?)" },
  { label: "Compatibilidade", value: "60% a 100%, ANSI e ABNT2, stem MX" },
  ...extra,
];

const SWITCH_SPECS = (spec: {
  type: string;
  force: string;
  bottom: string;
  pretravel: string;
  housing: string;
  stem: string;
  spring: string;
}): Spec[] => [
  { label: "Tipo", value: spec.type },
  { label: "Força de acionamento", value: spec.force },
  { label: "Força no fim do curso", value: spec.bottom },
  { label: "Pré-curso", value: spec.pretravel },
  { label: "Curso total", value: "4,0 mm" },
  { label: "Housing", value: spec.housing },
  { label: "Stem", value: spec.stem },
  { label: "Mola", value: spec.spring },
  { label: "Pinos", value: "5 pinos (PCB mount)" },
  { label: "Conteúdo", value: "Pack com 70, 90 ou 110 switches" },
];

const SWITCH_PACKS = (base: number): PackOption[] => [
  { id: "70", name: "70 un.", price: base },
  { id: "90", name: "90 un.", price: base + 60 },
  { id: "110", name: "110 un.", price: base + 115 },
];

export const PRODUCTS: Product[] = [
  {
    id: "kb-folk-75",
    slug: "folk-75",
    name: "Folk 75",
    category: "teclados",
    price: 1890,
    compareAtPrice: 2090,
    tagline: "O 75% que a gente queria na mesa: alumínio, gasket e um knob que dá gosto de girar.",
    description: [
      "Case em alumínio 6063 usinado em CNC e anodizado, com 1,9 kg que não saem do lugar. A placa de FR4 flutua sobre tiras de poron (gasket mount), então cada tecla assenta macia, sem eco metálico.",
      "PCB hot-swap de 5 pinos: troque de switch sem solda, quando quiser. QMK e VIA de fábrica para remapear camadas, macros e a função do knob direto no navegador.",
      "Sai da caixa com estabilizadores de parafuso lubrificados e ajustados à mão, espuma de case e IXPE sob a PCB. O som é grave, redondo e sem chiado.",
    ],
    specs: [
      { label: "Layout", value: "75% ANSI, 84 teclas + knob" },
      { label: "Case", value: "Alumínio 6063 anodizado, usinado em CNC" },
      { label: "Montagem", value: "Gasket mount com poron" },
      { label: "Placa", value: "FR4" },
      { label: "PCB", value: "Hot-swap 5 pinos, switches south-facing" },
      { label: "Firmware", value: "QMK e VIA" },
      { label: "Conexão", value: "USB-C (cabo incluso)" },
      { label: "Ângulo de digitação", value: "6,5°" },
      { label: "Peso", value: "1,9 kg montado" },
      { label: "Dimensões", value: "327 × 143 × 32 mm" },
    ],
    status: { kind: "low-stock", left: 12 },
    featured: true,
    rating: 4.9,
    reviewCount: 214,
    releasedAt: "2026-08-12",
    layout: "75",
    options: {
      cases: [CASES.laguna, CASES.grafite, CASES.prata, CASES.mochi],
      switches: KEYBOARD_SWITCHES,
    },
    model: { kind: "keyboard", layout: "75" },
    render: "/renders/folk-75.webp",
    alt: "Teclado Folk 75 com case de alumínio anodizado e keycaps em tons claros, visto de cima em ângulo",
    related: ["degrau", "noturno", "cabo-espiralado-usb-c", "topografia"],
  },
  {
    id: "kb-folk-65",
    slug: "folk-65",
    name: "Folk 65",
    category: "teclados",
    price: 1290,
    tagline: "Compacto sem abrir mão das setas. O primeiro custom que cabe em qualquer mesa.",
    description: [
      "Todo o essencial em 68 teclas: setas dedicadas, coluna de navegação e nada sobrando. O case é de alumínio anodizado com borda chanfrada polida à mão.",
      "Montagem top mount com placa de policarbonato, que flexiona o suficiente para deixar a digitação macia e o som mais encorpado.",
      "PCB hot-swap, QMK/VIA e estabilizadores lubrificados. Pronto para receber o switch que você escolher hoje, ou daqui a seis meses.",
    ],
    specs: [
      { label: "Layout", value: "65% ANSI, 68 teclas" },
      { label: "Case", value: "Alumínio 6063 anodizado" },
      { label: "Montagem", value: "Top mount" },
      { label: "Placa", value: "Policarbonato" },
      { label: "PCB", value: "Hot-swap 5 pinos" },
      { label: "Firmware", value: "QMK e VIA" },
      { label: "Conexão", value: "USB-C" },
      { label: "Peso", value: "1,4 kg montado" },
      { label: "Dimensões", value: "318 × 110 × 30 mm" },
    ],
    status: { kind: "in-stock" },
    featured: false,
    rating: 4.8,
    reviewCount: 167,
    releasedAt: "2026-03-02",
    layout: "65",
    options: { cases: [CASES.matcha, CASES.prata, CASES.grafite], switches: KEYBOARD_SWITCHES },
    model: { kind: "keyboard", layout: "65" },
    render: "/renders/folk-65.webp",
    alt: "Teclado Folk 65 compacto com case verde-sálvia e keycaps Matcha",
    related: ["creme", "matcha", "grade", "cabo-espiralado-usb-c"],
  },
  {
    id: "kb-folk-tkl",
    slug: "folk-tkl",
    name: "Folk TKL",
    category: "teclados",
    price: 2190,
    tagline: "Tenkeyless completo para quem não larga o F-row nem o bloco de navegação.",
    description: [
      "87 teclas, bloco de navegação completo e um peso de latão de 480 g na base que deixa o TKL plantado na mesa e o som mais grave.",
      "Gasket mount com placa de alumínio e espuma de silicone no fundo do case. Digitação firme, sem ser dura; som profundo, sem ser abafado.",
      "Hot-swap, QMK/VIA e cabo destacável. Feito para durar mais do que o seu próximo computador.",
    ],
    specs: [
      { label: "Layout", value: "TKL ANSI, 87 teclas" },
      { label: "Case", value: "Alumínio 6063 anodizado + peso de latão" },
      { label: "Montagem", value: "Gasket mount" },
      { label: "Placa", value: "Alumínio" },
      { label: "PCB", value: "Hot-swap 5 pinos" },
      { label: "Firmware", value: "QMK e VIA" },
      { label: "Conexão", value: "USB-C" },
      { label: "Peso", value: "2,6 kg montado" },
      { label: "Dimensões", value: "365 × 143 × 33 mm" },
    ],
    status: { kind: "in-stock" },
    featured: false,
    rating: 4.9,
    reviewCount: 98,
    releasedAt: "2025-11-20",
    layout: "tkl",
    options: { cases: [CASES.grafite, CASES.prata], switches: KEYBOARD_SWITCHES },
    model: { kind: "keyboard", layout: "tkl" },
    render: "/renders/folk-tkl.webp",
    alt: "Teclado Folk TKL grafite com keycaps Noturno em roxo e ciano",
    related: ["degrau", "noturno", "topografia", "cabo-espiralado-usb-c"],
  },
  {
    id: "kb-folk-40-orto",
    slug: "folk-40-orto",
    name: "Folk 40 Orto",
    category: "teclados",
    price: 990,
    tagline: "Grade ortolinear 4×12 para quem gosta de camadas e de mão parada.",
    description: [
      "Teclas em colunas retas, sem escalonamento: os dedos só sobem e descem. Parece estranho por dois dias e depois você não quer outra coisa.",
      "48 teclas de 1u e quatro camadas pré-configuradas em QMK para números, símbolos, navegação e mídia. Tudo remapeável no VIA.",
      "Case de alumínio fino com placa de FR4 e montagem em sanduíche. Leve para levar na mochila, firme para digitar o dia inteiro.",
    ],
    specs: [
      { label: "Layout", value: "40% ortolinear, 4 × 12 (48 teclas)" },
      { label: "Case", value: "Alumínio anodizado, perfil baixo" },
      { label: "Montagem", value: "Sanduíche" },
      { label: "Placa", value: "FR4" },
      { label: "PCB", value: "Hot-swap 5 pinos" },
      { label: "Firmware", value: "QMK e VIA, 4 camadas de fábrica" },
      { label: "Conexão", value: "USB-C" },
      { label: "Peso", value: "780 g montado" },
      { label: "Dimensões", value: "240 × 86 × 24 mm" },
    ],
    status: { kind: "preorder", label: "Pré-venda — envio em novembro" },
    featured: false,
    rating: 4.7,
    reviewCount: 41,
    releasedAt: "2026-09-10",
    layout: "40-orto",
    options: { cases: [CASES.prata, CASES.laguna], switches: KEYBOARD_SWITCHES },
    model: { kind: "keyboard", layout: "40-orto" },
    render: "/renders/folk-40-orto.webp",
    alt: "Teclado Folk 40 Orto com grade ortolinear de 48 teclas",
    related: ["creme", "sinal", "grade", "cabo-espiralado-usb-c"],
  },
  ...(
    [
      {
        id: "mochi" as const,
        price: 459,
        tagline: "Rosa de doceria, legendas cor de chocolate e um Enter verde-chá.",
        mood: "Alfas creme com legendas cor de chocolate, modificadores rosa-morango e acentos verde-chá. Fofo sem ser infantil.",
        rating: 4.8,
        reviews: 132,
        released: "2026-02-14",
        alt: "Keycaps Mochi em creme, rosa e verde, dispostos em um recorte de layout",
      },
      {
        id: "laguna" as const,
        price: 459,
        tagline: "Azul-petróleo com um Esc amarelo-sol. Fica bonito em qualquer case claro.",
        mood: "Alfas quase brancas, modificadores azul-petróleo e acentos amarelo-sol. Inspirado nas lagoas do litoral nordestino.",
        rating: 4.9,
        reviews: 187,
        released: "2025-12-01",
        alt: "Keycaps Laguna em branco, azul-petróleo e amarelo",
      },
      {
        id: "sinal" as const,
        price: 459,
        tagline: "Cinza de prancheta com laranja de sinalização. Sóbrio até você apertar o Esc.",
        mood: "Alfas cinza-claro, modificadores grafite e acentos laranja-sinal. Um clássico retrô com contraste alto para ler bem.",
        rating: 4.8,
        reviews: 156,
        released: "2025-09-18",
        alt: "Keycaps Sinal em cinza-claro, grafite e laranja",
      },
      {
        id: "matcha" as const,
        price: 459,
        tagline: "Verde de chá batido, creme e mel. Calmo como a primeira xícara do dia.",
        mood: "Alfas creme, modificadores verde-matcha e acentos cor de mel. Pede madeira clara na mesa e planta no canto.",
        rating: 4.7,
        reviews: 94,
        released: "2026-05-06",
        alt: "Keycaps Matcha em creme, verde e mel",
      },
      {
        id: "noturno" as const,
        price: 489,
        tagline: "Madrugada roxa com legendas lilás e um ciano que brilha como monitor às 2h.",
        mood: "Alfas roxo-noite, modificadores índigo e acentos ciano. Legendas lilás com contraste alto, feitas para setups escuros.",
        rating: 5.0,
        reviews: 241,
        released: "2026-07-22",
        alt: "Keycaps Noturno em roxo-escuro, índigo e ciano",
      },
    ] satisfies Array<{
      id: ColorwayId;
      price: number;
      tagline: string;
      mood: string;
      rating: number;
      reviews: number;
      released: string;
      alt: string;
    }>
  ).map(
    (k): Product => ({
      id: `kc-${k.id}`,
      slug: k.id,
      name: k.id.charAt(0).toUpperCase() + k.id.slice(1),
      category: "keycaps",
      price: k.price,
      tagline: k.tagline,
      description: [
        k.mood,
        "PBT grosso de 1,5 mm com legendas em dye-sublimation: a tinta entra no plástico, então não desbota nem ganha brilho com o uso. Textura fosca, levemente arenosa, que segura o dedo.",
        "São 158 teclas no perfil Cherry, com extras para ABNT2 (Ç, ~ ^ e / ?), barras de espaço de 6,25u e 7u e modificadores para layouts de 60% a 100%.",
      ],
      specs: KEYCAP_SPECS(),
      status: { kind: "in-stock" },
      featured: k.id === "noturno",
      rating: k.rating,
      reviewCount: k.reviews,
      releasedAt: k.released,
      options: {},
      model: { kind: "keycaps", colorway: k.id },
      render: `/renders/${k.id}.webp`,
      alt: k.alt,
      related: k.id === "noturno" ? ["folk-tkl", "degrau", "topografia"] : ["folk-75", "creme", "grade"],
    }),
  ),
  {
    id: "sw-creme",
    slug: "creme",
    name: "Creme",
    category: "switches",
    price: 249,
    switchType: "linear",
    tagline: "Linear de 45 g, liso como manteiga. Descida sem degrau, volta sem chiado.",
    description: [
      "Stem de POM autolubrificante dentro de um housing de nylon: a combinação clássica para um som grave e arredondado, o famoso “thock”.",
      "Lubrificados de fábrica com Krytox 205g0 na medida certa: nada de arranhado, nada de excesso. A mola de 22 mm banhada a ouro elimina o ping.",
      "Para quem digita rápido, joga e gosta de uma descida contínua do começo ao fim.",
    ],
    specs: SWITCH_SPECS({
      type: "Linear",
      force: "45 g",
      bottom: "55 g",
      pretravel: "2,0 mm",
      housing: "Nylon (topo e base)",
      stem: "POM",
      spring: "22 mm, banhada a ouro",
    }),
    status: { kind: "in-stock" },
    featured: false,
    rating: 4.8,
    reviewCount: 312,
    releasedAt: "2025-06-10",
    options: { packs: SWITCH_PACKS(249) },
    model: { kind: "switch", switchType: "linear", stem: "#F1D9A7", top: "#F6EEDC", bottom: "#E9DEC6" },
    render: "/renders/creme.webp",
    alt: "Switch mecânico Creme com housing creme translúcido e stem amarelo-manteiga",
    related: ["folk-65", "laguna", "degrau"],
  },
  {
    id: "sw-degrau",
    slug: "degrau",
    name: "Degrau",
    category: "switches",
    price: 269,
    switchType: "tatil",
    tagline: "Tátil de 62 g com o bump bem no topo. Você sente a tecla registrar.",
    description: [
      "O “degrau” fica logo no início do curso: um toque arredondado e marcado que avisa que a tecla registrou, sem precisar ir até o fim.",
      "Housing de policarbonato no topo para um som mais claro e base de nylon para segurar o grave. Lubrificação leve de fábrica que não apaga o bump.",
      "Feito para quem programa o dia inteiro e quer precisão sem barulho de clique.",
    ],
    specs: SWITCH_SPECS({
      type: "Tátil",
      force: "62 g (pico do bump)",
      bottom: "67 g",
      pretravel: "1,9 mm",
      housing: "Policarbonato (topo) e nylon (base)",
      stem: "POM",
      spring: "20 mm, dois estágios",
    }),
    status: { kind: "in-stock" },
    featured: true,
    rating: 4.9,
    reviewCount: 276,
    releasedAt: "2026-04-15",
    options: { packs: SWITCH_PACKS(269) },
    model: { kind: "switch", switchType: "tatil", stem: "#E9824E", top: "#F4F4F2", bottom: "#E7E4DE" },
    render: "/renders/degrau.webp",
    alt: "Switch mecânico Degrau com housing transparente e stem laranja-terracota",
    related: ["folk-75", "noturno", "creme"],
  },
  {
    id: "sw-estalo",
    slug: "estalo",
    name: "Estalo",
    category: "switches",
    price: 229,
    switchType: "clicky",
    tagline: "Clicky de 60 g com barra de clique. Barulhento, honesto e viciante.",
    description: [
      "Mecanismo de click bar: em vez da jaqueta clássica, uma barra de aço estala contra o stem. O clique é mais nítido e consistente, na descida e na volta.",
      "Housing de policarbonato para projetar o som e stem de POM. Não é para chamada de vídeo, é para quem ama ouvir cada tecla.",
      "Esgotou no primeiro lote. Deixe o aviso ligado que a gente chama quando o próximo chegar.",
    ],
    specs: SWITCH_SPECS({
      type: "Clicky (click bar)",
      force: "60 g",
      bottom: "70 g",
      pretravel: "1,8 mm",
      housing: "Policarbonato",
      stem: "POM",
      spring: "20 mm",
    }),
    status: { kind: "sold-out" },
    featured: false,
    rating: 4.6,
    reviewCount: 88,
    releasedAt: "2026-06-01",
    options: { packs: SWITCH_PACKS(229) },
    model: { kind: "switch", switchType: "clicky", stem: "#4B8FE0", top: "#EEF4FA", bottom: "#E2E8EE" },
    render: "/renders/estalo.webp",
    alt: "Switch mecânico Estalo com housing transparente e stem azul",
    related: ["folk-tkl", "sinal", "degrau"],
  },
  {
    id: "dm-topografia",
    slug: "topografia",
    name: "Topografia",
    category: "deskmats",
    price: 179,
    tagline: "Curvas de nível de uma serra imaginária. 90 × 40 cm de mesa mais bonita.",
    description: [
      "Estampa de curvas de nível desenhada por aqui, impressa por sublimação: as linhas não descascam nem racham com o tempo.",
      "Tecido de trama fechada que desliza bem para o mouse e base de borracha natural que não sai do lugar. Bordas costuradas para não desfiar.",
      "Tem 4 mm de espessura: abafa o som do teclado e deixa a mesa mais macia para os pulsos.",
    ],
    specs: [
      { label: "Tamanho", value: "900 × 400 mm" },
      { label: "Espessura", value: "4 mm" },
      { label: "Superfície", value: "Tecido de trama fechada, sublimado" },
      { label: "Base", value: "Borracha natural antiderrapante" },
      { label: "Bordas", value: "Costuradas" },
      { label: "Lavagem", value: "À mão, água fria e sabão neutro" },
    ],
    status: { kind: "in-stock" },
    featured: false,
    rating: 4.8,
    reviewCount: 143,
    releasedAt: "2026-01-20",
    options: {},
    model: { kind: "deskmat", pattern: "topografia", base: "#DDD2BC", ink: "#2F4B46", accent: "#D9772B" },
    render: "/renders/topografia.webp",
    alt: "Deskmat Topografia com curvas de nível verdes sobre fundo areia",
    related: ["folk-75", "grade", "cabo-espiralado-usb-c"],
  },
  {
    id: "dm-grade",
    slug: "grade",
    name: "Grade",
    category: "deskmats",
    price: 179,
    tagline: "Papel quadriculado em tamanho de mesa. Para quem pensa em pixels e milímetros.",
    description: [
      "Grade de 10 mm com marcações a cada 50 mm, como papel milimetrado de engenharia. Ajuda a alinhar teclado, mouse e caneca (sim, a caneca).",
      "Tecido de trama fechada, sublimado, com base de borracha natural e bordas costuradas.",
      "Tem 4 mm de espessura e vai bem com qualquer colorway, especialmente os mais sóbrios.",
    ],
    specs: [
      { label: "Tamanho", value: "900 × 400 mm" },
      { label: "Espessura", value: "4 mm" },
      { label: "Superfície", value: "Tecido de trama fechada, sublimado" },
      { label: "Base", value: "Borracha natural antiderrapante" },
      { label: "Bordas", value: "Costuradas" },
      { label: "Lavagem", value: "À mão, água fria e sabão neutro" },
    ],
    status: { kind: "in-stock" },
    featured: false,
    rating: 4.7,
    reviewCount: 102,
    releasedAt: "2025-10-08",
    options: {},
    model: { kind: "deskmat", pattern: "grade", base: "#23252B", ink: "#8C93A1", accent: "#FF5B22" },
    render: "/renders/grade.webp",
    alt: "Deskmat Grade grafite com linhas de papel milimetrado",
    related: ["folk-tkl", "sinal", "topografia"],
  },
  {
    id: "ac-cabo",
    slug: "cabo-espiralado-usb-c",
    name: "Cabo espiralado USB-C",
    category: "acessorios",
    price: 219,
    tagline: "Espiral de 15 cm e conector aviador banhado a ouro. O acabamento que faltava.",
    description: [
      "Cabo trançado em paracord com espiral de 15 cm feita à mão e conector aviador GX16 de 5 pinos, que destrava com meia volta.",
      "USB-C no teclado, USB-C ou USB-A no computador (vai um adaptador na caixa). Suporta dados em USB 2.0, o que todo teclado usa.",
      "Tem 1,5 m no total: dá para passar por trás do monitor e ainda sobrar espiral na frente.",
    ],
    specs: [
      { label: "Comprimento", value: "1,5 m (espiral de 15 cm)" },
      { label: "Conector aviador", value: "GX16, 5 pinos, banhado a ouro" },
      { label: "Pontas", value: "USB-C (teclado) e USB-C + adaptador USB-A" },
      { label: "Revestimento", value: "Paracord trançado sobre TPU" },
      { label: "Dados", value: "USB 2.0" },
    ],
    status: { kind: "in-stock" },
    featured: true,
    rating: 4.9,
    reviewCount: 189,
    releasedAt: "2026-08-30",
    options: {},
    model: { kind: "cable", sleeve: "#1F6F78", connector: "#C9CCD1" },
    render: "/renders/cabo-espiralado-usb-c.webp",
    alt: "Cabo USB-C espiralado azul-petróleo com conector aviador prateado",
    related: ["folk-75", "folk-65", "laguna"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelated(product: Product): Product[] {
  return product.related
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => Boolean(p));
}

export const FEATURED_ORDER = ["folk-75", "noturno", "degrau", "cabo-espiralado-usb-c"];

export function getFeatured(): Product[] {
  return FEATURED_ORDER.map((s) => getProduct(s)).filter((p): p is Product => Boolean(p));
}
