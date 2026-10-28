/**
 * Catálogo da Terra do Sol montado a partir das publicações do Instagram
 * @terradosol_lavras (consultado em 27/10/2026).
 *
 * O que é real: nome/descrição (das legendas), fotos, cores e tamanhos
 * citados nas legendas, e a publicação de origem (campo `post`).
 * O que é demonstrativo: preços (exceto `priceConfirmed: true`), grade de
 * tamanhos (exceto `sizesConfirmed: true`) e disponibilidade.
 */

export type CategoryId =
  | 'vestidos'
  | 'conjuntos'
  | 'blusas'
  | 'calcas-shorts'
  | 'blazers-jaquetas'
  | 'trico'

export type Season = 'primavera-verao' | 'outono-inverno'

export interface Product {
  id: string
  slug: string
  name: string
  category: CategoryId
  season: Season
  /** Texto escrito a partir da legenda do post (ou da foto, quando não há legenda). */
  description: string
  /** Quando true, a descrição veio da legenda; quando false, foi escrita a partir da foto. */
  captionBased: boolean
  /** Preço em centavos. */
  price: number
  priceConfirmed?: boolean
  colors: string[]
  colorsConfirmed?: boolean
  sizes: string[]
  sizesConfirmed?: boolean
  /** Quantidade de fotos em /public/img/p/{slug}-{n}-{w}.webp */
  images: number
  /** Código da publicação no Instagram de origem. */
  post: string
  /** Data da publicação (AAAA-MM-DD), quando registrada. */
  postedAt?: string
  /** Peça marcada como novidade (publicada em set–out/2026). */
  isNew?: boolean
  /** Marca de terceiros citada na legenda. */
  brand?: string
  /** Quantidade máxima por pedido (estoque demonstrativo). */
  maxQty: number
}

export const categories: { id: CategoryId; label: string; short: string }[] = [
  { id: 'vestidos', label: 'Vestidos', short: 'Vestidos' },
  { id: 'conjuntos', label: 'Conjuntos', short: 'Conjuntos' },
  { id: 'blusas', label: 'Blusas', short: 'Blusas' },
  { id: 'calcas-shorts', label: 'Calças e shorts', short: 'Calças' },
  { id: 'blazers-jaquetas', label: 'Blazers e jaquetas', short: 'Blazers' },
  { id: 'trico', label: 'Tricô e cashmere', short: 'Tricô' },
]

export const seasons: { id: Season; label: string }[] = [
  { id: 'primavera-verao', label: 'Primavera / Verão' },
  { id: 'outono-inverno', label: 'Outono / Inverno' },
]

const DEMO_SIZES = ['P', 'M', 'G']

type Seed = Omit<Product, 'id' | 'sizes' | 'maxQty'> & { sizes?: string[]; maxQty?: number }

const seed: Seed[] = [
  // ——— Novidades (set–out/2026) ———
  {
    slug: 'vestido-longo-lurex',
    name: 'Vestido longo com fios de lurex',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido longo e fluido, de tecido com fios em lurex que dão um brilho leve. Alças finas com amarração no decote e saia ampla.',
    captionBased: true,
    price: 38990,
    colors: ['Verde-sálvia'],
    images: 1,
    post: 'DePt7CGBwQl',
    postedAt: '2026-10-08',
    isNew: true,
  },
  {
    slug: 'conjunto-shorts-blusa-paisley',
    name: 'Conjunto shorts e blusa assimétrica paisley',
    category: 'conjuntos',
    season: 'primavera-verao',
    description:
      'Shorts e blusa de alças com barra assimétrica, em tecido com estampa paisley bordada. Peças vendidas juntas.',
    captionBased: true,
    price: 32990,
    colors: ['Azul-claro'],
    images: 3,
    post: 'DeKpYaGAbeb',
    postedAt: '2026-10-06',
    isNew: true,
  },
  {
    slug: 'vestido-midi-azul-amarracao',
    name: 'Vestido midi azul com amarração',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido midi de alças em tom azul, com saia evasê de barra assimétrica e tiras de amarração nas costas.',
    captionBased: false,
    price: 34990,
    colors: ['Azul'],
    images: 1,
    post: 'DeIIRt_AS3J',
    postedAt: '2026-10-05',
    isNew: true,
  },
  {
    slug: 'vestido-tomara-que-caia-paisley',
    name: 'Vestido tomara que caia bordado paisley',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido curto bordado em estampa paisley. A pala no decote tomara que caia é o detalhe que dá acabamento à peça.',
    captionBased: true,
    price: 29990,
    colors: ['Azul-claro'],
    images: 1,
    post: 'Dd7Fa7ehF8p',
    postedAt: '2026-09-30',
    isNew: true,
  },
  {
    slug: 'vestido-longo-verde-oliva',
    name: 'Vestido longo verde-oliva em camadas',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido longo de alças finas e decote em V, com saia em camadas franzidas. Tom verde-oliva.',
    captionBased: false,
    price: 36990,
    colors: ['Verde-oliva'],
    images: 1,
    post: 'Ddri8m1m_LI',
    postedAt: '2026-09-24',
    isNew: true,
  },
  {
    slug: 'vestido-midi-estampado-azul',
    name: 'Vestido midi estampado azul e off-white',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido midi sem mangas, com estampa abstrata em azul e off-white, cordão na cintura e barra com babado.',
    captionBased: false,
    price: 37990,
    colors: ['Azul', 'Off-white'],
    images: 2,
    post: 'Ddj--CSgScQ',
    postedAt: '2026-09-21',
    isNew: true,
  },
  {
    slug: 'vestido-midi-branco-bordado',
    name: 'Vestido midi branco bordado',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido midi branco, sem mangas, com bordado delicado em toda a peça e cordão de amarração na cintura com pingentes.',
    captionBased: false,
    price: 41990,
    colors: ['Branco'],
    images: 4,
    post: 'DdXNsFXgQzl',
    postedAt: '2026-09-16',
    isNew: true,
  },
  {
    slug: 'vestido-curto-amarelo-manteiga',
    name: 'Vestido curto amarelo-manteiga',
    category: 'vestidos',
    season: 'primavera-verao',
    description: 'Vestido curto de decote frente única no amarelo-manteiga, a cor que a loja vem destacando no verão.',
    captionBased: true,
    price: 25990,
    colors: ['Amarelo-manteiga'],
    images: 1,
    post: 'DdR4iOAhr6o',
    isNew: true,
  },
  {
    slug: 'vestido-rendado-peplum',
    name: 'Vestido rendado com peplum duplo',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido midi rendado da marca Lado Avesso. O destaque é a cintura com modelagem peplum dupla.',
    captionBased: true,
    brand: 'Lado Avesso',
    price: 54990,
    colors: ['Areia'],
    images: 1,
    post: 'DdB3goARol7',
    postedAt: '2026-09-08',
    isNew: true,
  },
  {
    slug: 'vestido-floral-liberty',
    name: 'Vestido floral Liberty',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido midi em estampa floral Liberty, a padronagem de florzinhas miúdas e próximas que nasceu na loja Liberty of London, em 1875.',
    captionBased: true,
    price: 31990,
    colors: ['Off-white'],
    images: 1,
    post: 'Dc4JTJrkWPh',
    postedAt: '2026-09-04',
    isNew: true,
  },
  {
    slug: 't-shirt-floral-minimalista',
    name: 'T-shirt floral minimalista',
    category: 'blusas',
    season: 'primavera-verao',
    description: 'T-shirt de malha com estampa floral miúda, delicada e feminina.',
    captionBased: true,
    price: 12990,
    colors: ['Off-white'],
    images: 1,
    post: 'DczUWBHEd8G',
    postedAt: '2026-09-02',
    isNew: true,
  },
  {
    slug: 'blusa-malha-recortes',
    name: 'Blusa de malha com recortes',
    category: 'blusas',
    season: 'primavera-verao',
    description:
      'Blusa de malha com recortes e texturas diferentes, com alça cruzada no pescoço. Uma peça de malha que foge do básico.',
    captionBased: true,
    price: 13990,
    colors: ['Preto'],
    images: 1,
    post: 'DcwcHFTGwLB',
    postedAt: '2026-09-01',
    isNew: true,
  },
  {
    slug: 'vestido-midi-bambi-microtule',
    name: 'Vestido midi bambi em microtule',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido midi em estampa bambi com decote bobo. O microtule tem elasticidade, o que deixa a peça confortável sem perder a sofisticação.',
    captionBased: true,
    price: 33990,
    colors: ['Marrom'],
    images: 1,
    post: 'DctrvSXROZz',
  },
  {
    slug: 'calca-linho-poa',
    name: 'Calça de linho poá',
    category: 'calcas-shorts',
    season: 'primavera-verao',
    description:
      'Calça de linho com estampa de poá. No post, foi combinada com uma regata de modal preta e branca.',
    captionBased: true,
    price: 27990,
    colors: ['Off-white com poá'],
    images: 1,
    post: 'Dcn1wAUhd1u',
  },
  {
    slug: 'max-blazer-risca-de-giz',
    name: 'Max blazer risca de giz',
    category: 'blazers-jaquetas',
    season: 'primavera-verao',
    description:
      'Blazer amplo em risca de giz, a terceira peça que completa o conjunto de calça e colete do mesmo tecido.',
    captionBased: true,
    price: 39990,
    colors: ['Branco'],
    images: 1,
    post: 'DchVqFCR15V',
  },
  {
    slug: 'conjunto-calca-colete-risca-de-giz',
    name: 'Conjunto calça e colete risca de giz',
    category: 'conjuntos',
    season: 'primavera-verao',
    description:
      'Conjunto de alfaiataria com calça e colete em risca de giz. A loja informou duas cores: branco e bege. Combina com o max blazer do mesmo tecido.',
    captionBased: true,
    price: 44990,
    colors: ['Branco', 'Bege'],
    colorsConfirmed: true,
    images: 4,
    post: 'Dcd0uA9Efuy',
  },
  {
    slug: 'blusa-sleepwear-renda',
    name: 'Blusa sleepwear com renda',
    category: 'blusas',
    season: 'primavera-verao',
    description:
      'Blusa no estilo sleepwear, com toque acetinado, renda e barra assimétrica. Cores informadas pela loja: azul e amarelo, em tons pastel.',
    captionBased: true,
    price: 18990,
    colors: ['Azul', 'Amarelo'],
    colorsConfirmed: true,
    images: 4,
    post: 'Db38BFVAQun',
  },
  {
    slug: 'blusa-estampada-floral-preta',
    name: 'Blusa floral fundo preto',
    category: 'blusas',
    season: 'primavera-verao',
    description: 'Blusa fluida de manga longa bufante, com estampa floral sobre fundo preto e amarração no decote.',
    captionBased: false,
    price: 19990,
    colors: ['Preto'],
    images: 1,
    post: 'DZqMyP9hwkB',
  },
  // ——— Outono / inverno ———
  {
    slug: 'jaqueta-vinho-botoes',
    name: 'Jaqueta vinho com botões de pressão',
    category: 'blazers-jaquetas',
    season: 'outono-inverno',
    description:
      'Jaqueta de toque aveludado no tom vinho, com botões de pressão dourados, gola ampla e acabamento de renda na barra.',
    captionBased: false,
    price: 42990,
    colors: ['Vinho'],
    images: 3,
    post: 'DaJa5Mskcll',
  },
  {
    slug: 'blusa-trico-vazado-preta',
    name: 'Blusa de tricô vazado preta',
    category: 'trico',
    season: 'outono-inverno',
    description: 'Blusa de manga longa em tricô vazado preto. Nas fotos aparece por cima de um colete de amarrar.',
    captionBased: false,
    price: 17990,
    colors: ['Preto'],
    images: 3,
    post: 'DaVkuRPEeiy',
  },
  {
    slug: 'blusa-trico-gola-alta-vinho',
    name: 'Blusa de tricô gola alta vinho',
    category: 'trico',
    season: 'outono-inverno',
    description: 'Tricô de gola alta no tom vinho, com tramas trabalhadas e ombros franzidos.',
    captionBased: false,
    price: 21990,
    colors: ['Vinho'],
    images: 3,
    post: 'DZnR3KfkfY-',
  },
  {
    slug: 'trico-poa',
    name: 'Tricô poá decote V',
    category: 'trico',
    season: 'outono-inverno',
    description: 'O clássico tricô com poá: off-white com bolas pretas, decote V e acabamentos em contraste.',
    captionBased: true,
    price: 22990,
    colors: ['Off-white e preto'],
    images: 2,
    post: 'DZVJ7GakSgN',
  },
  {
    slug: 'vestido-trico-plumas',
    name: 'Vestido de tricô com plumas',
    category: 'trico',
    season: 'outono-inverno',
    description:
      'Vestido curto em tricô com plumas na barra. Disponível no bege e no preto, segundo a loja.',
    captionBased: true,
    price: 32990,
    colors: ['Bege', 'Preto'],
    colorsConfirmed: true,
    images: 3,
    post: 'DYW264gkQfX',
  },
  {
    slug: 'max-jaqueta-azul',
    name: 'Max jaqueta azul-marinho',
    category: 'blazers-jaquetas',
    season: 'outono-inverno',
    description: 'Jaqueta ampla e curta, de modelagem despojada, para usar no inverno.',
    captionBased: true,
    price: 35990,
    colors: ['Azul-marinho'],
    images: 1,
    post: 'DYpP-KJxDtN',
  },
  {
    slug: 'blazer-off-white',
    name: 'Blazer de alfaiataria',
    category: 'blazers-jaquetas',
    season: 'outono-inverno',
    description: 'Blazer de alfaiataria recém-chegado à loja. A legenda cita duas cores: off-white e marrom.',
    captionBased: true,
    price: 39990,
    colors: ['Off-white', 'Marrom'],
    colorsConfirmed: true,
    images: 1,
    post: 'DYkfeAaRD0_',
  },
  {
    slug: 'casaquinho-cashmere',
    name: 'Casaquinho de cashmere com botões dourados',
    category: 'trico',
    season: 'outono-inverno',
    description:
      'Casaquinho de cashmere com trança e botões dourados, um clássico do inverno. Na foto aparecem preto, vinho e off-white.',
    captionBased: true,
    price: 24990,
    colors: ['Preto', 'Vinho', 'Off-white'],
    images: 1,
    post: 'DXb-7dWjS4Y',
  },
  {
    slug: 'blusa-ombro-so-veludo',
    name: 'Blusa ombro só em veludo com strass',
    category: 'blusas',
    season: 'outono-inverno',
    description: 'Blusa de um ombro só em veludo preto, com tachinhas de strass delicadas.',
    captionBased: true,
    price: 22990,
    colors: ['Preto'],
    images: 3,
    post: 'DXExm1ajWRT',
  },
  {
    slug: 'polo-cashmere',
    name: 'Blusa polo de cashmere',
    category: 'trico',
    season: 'outono-inverno',
    description: 'Polo de manga curta em cashmere, com filete em contraste na gola e na barra.',
    captionBased: true,
    price: 18990,
    colors: ['Vinho', 'Bege', 'Preto'],
    images: 2,
    post: 'DW3zSMejW-r',
  },
  {
    slug: 'vestido-tule-bambi',
    name: 'Vestido de tule estampa bambi',
    category: 'vestidos',
    season: 'outono-inverno',
    description: 'Vestido midi de tule com manga longa e estampa bambi, que a loja chamou de novo hit do animal print.',
    captionBased: true,
    price: 31990,
    colors: ['Marrom e bege'],
    images: 2,
    post: 'DWT81mUDd1e',
  },
  {
    slug: 'blusa-tule-zebra',
    name: 'Blusa de tule zebra',
    category: 'blusas',
    season: 'outono-inverno',
    description:
      'Blusa de tule com estampa zebra, ombro a ombro e franzidos. O tecido tem elastano, é versátil e funciona de dia ou à noite.',
    captionBased: true,
    price: 16990,
    colors: ['Preto e areia'],
    images: 2,
    post: 'DUbRdaNEcwz',
  },
  {
    slug: 'vestido-microtule-tomara-que-caia',
    name: 'Vestido microtule tomara que caia',
    category: 'vestidos',
    season: 'outono-inverno',
    description:
      'Vestido longo e fluido: saia em microtule e corpo tomara que caia em poliamida, dois tecidos finos na mesma peça.',
    captionBased: true,
    price: 36990,
    colors: ['Café'],
    images: 3,
    post: 'DSdhG3MgYHC',
  },
  {
    slug: 'vestido-em-linha-praia',
    name: 'Vestido em linha off-white',
    category: 'vestidos',
    season: 'primavera-verao',
    description: 'Vestido em linha, com trama aberta e franjas na barra. Leve e com clima de praia.',
    captionBased: true,
    price: 34990,
    colors: ['Off-white'],
    images: 1,
    post: 'DSvLnWkESO0',
  },
  {
    slug: 'vestido-azulejo-portugues',
    name: 'Vestido estampa azulejo',
    category: 'vestidos',
    season: 'primavera-verao',
    description: 'Vestido longo de alças com estampa inspirada nos azulejos portugueses, em azul e branco.',
    captionBased: true,
    price: 35990,
    colors: ['Azul e branco'],
    images: 3,
    post: 'DQuot24gdZA',
  },
  {
    slug: 'conjunto-texturizado-nude',
    name: 'Conjunto texturizado nude com lurex',
    category: 'conjuntos',
    season: 'primavera-verao',
    description: 'Conjunto de blusa e calça em tecido texturizado com fios delicados de lurex, no tom nude.',
    captionBased: true,
    price: 39990,
    colors: ['Nude'],
    images: 1,
    post: 'DQemPGEjTfu',
  },
  {
    slug: 'vestido-poa-fundo-preto',
    name: 'Vestido poá fundo preto',
    category: 'vestidos',
    season: 'primavera-verao',
    description: 'Vestido longo e fluido de poá colorido sobre fundo preto, com decote V e manga curta.',
    captionBased: true,
    price: 29990,
    colors: ['Preto'],
    images: 1,
    post: 'DPjujp3kegx',
  },
  {
    slug: 'conjunto-blazer-shorts-listrado',
    name: 'Conjunto blazer e shorts listrado',
    category: 'conjuntos',
    season: 'primavera-verao',
    description:
      'Blazer e shorts minimalista na mesma estampa listrada. No post, a composição leva uma blusa acetinada por baixo.',
    captionBased: true,
    price: 45990,
    colors: ['Off-white listrado'],
    images: 1,
    post: 'DPeHVP_DdrP',
  },
  {
    slug: 'conjunto-bordado-shorts-peplum',
    name: 'Conjunto bordado shorts e blusa peplum',
    category: 'conjuntos',
    season: 'primavera-verao',
    description: 'Shorts de alfaiataria e blusa tomara que caia com peplum, os dois no mesmo bordado.',
    captionBased: true,
    price: 38990,
    colors: ['Azul-marinho'],
    images: 3,
    post: 'DO6HxrLjeNJ',
  },
  {
    slug: 'conjunto-blazer-calca-amarelo',
    name: 'Blazer e calça de linho amarelo-manteiga',
    category: 'conjuntos',
    season: 'primavera-verao',
    description:
      'Blazer e calça de alfaiataria em linho amarelo-manteiga. No post, com blusa de babados por baixo.',
    captionBased: true,
    price: 49990,
    colors: ['Amarelo-manteiga'],
    images: 1,
    post: 'DNTjNvbRu8n',
  },
  {
    slug: 'conjunto-linho-amarelo-colete',
    name: 'Conjunto de linho calça e blusa colete',
    category: 'conjuntos',
    season: 'primavera-verao',
    description: 'Conjunto em linho amarelo-manteiga, com calça reta e blusa no estilo colete.',
    captionBased: true,
    price: 35990,
    colors: ['Amarelo-manteiga'],
    images: 1,
    post: 'DL-yqJvR8g3',
  },
  {
    slug: 'vestido-longo-argola',
    name: 'Vestido longo de manga única com argola',
    category: 'vestidos',
    season: 'primavera-verao',
    description: 'Vestido liso, longo e fluido, de um ombro só, com detalhe de argola na manga.',
    captionBased: true,
    price: 33990,
    colors: ['Marrom'],
    images: 1,
    post: 'DL7mmjguL0C',
  },
  {
    slug: 'calca-wide-leg-marrom',
    name: 'Calça wide leg marrom',
    category: 'calcas-shorts',
    season: 'outono-inverno',
    description: 'Calça wide leg marrom, sem elastano. O valor foi divulgado pela loja no Instagram.',
    captionBased: true,
    price: 14900,
    priceConfirmed: true,
    colors: ['Marrom'],
    images: 1,
    post: 'DLs714tugOs',
  },
  {
    slug: 'conjunto-alfaiataria-camel',
    name: 'Conjunto alfaiataria camel',
    category: 'conjuntos',
    season: 'outono-inverno',
    description: 'Calça reta e max blazer de um botão em alfaiataria camel. Tamanhos informados pela loja: P, M e G.',
    captionBased: true,
    price: 46990,
    colors: ['Camel'],
    sizes: ['P', 'M', 'G'],
    sizesConfirmed: true,
    images: 1,
    post: 'DLImUdGOS7C',
  },
  {
    slug: 'casaco-tweed-off-white',
    name: 'Casaco de tweed off-white',
    category: 'blazers-jaquetas',
    season: 'outono-inverno',
    description: 'Casaco alongado de tweed off-white, com botões e bolsos.',
    captionBased: true,
    price: 52990,
    colors: ['Off-white'],
    images: 1,
    post: 'DKrrnvuOuCv',
  },
  {
    slug: 'conjunto-saia-jaquetinha-tweed',
    name: 'Conjunto saia e jaquetinha de tweed',
    category: 'conjuntos',
    season: 'outono-inverno',
    description: 'Saia curta e jaquetinha de tweed com bolsos, vendidas como conjunto.',
    captionBased: true,
    price: 48990,
    colors: ['Cinza-claro'],
    images: 1,
    post: 'DJ6vx-dR_HE',
  },
  {
    slug: 'calca-xadrez-cenoura',
    name: 'Calça xadrez cenoura',
    category: 'calcas-shorts',
    season: 'outono-inverno',
    description: 'Calça de estampa xadrez com modelagem cenoura, soltinha na medida.',
    captionBased: true,
    price: 23990,
    colors: ['Xadrez cinza'],
    images: 1,
    post: 'DI9oibyR9lK',
  },
  {
    slug: 'calca-sarja-azul-celeste',
    name: 'Calça de sarja Panamá azul-celeste',
    category: 'calcas-shorts',
    season: 'primavera-verao',
    description:
      'Calça de sarja Panamá azul-celeste. No post, combinada com camisa de renda vazada na manga 3/4.',
    captionBased: true,
    price: 21990,
    colors: ['Azul-celeste'],
    images: 1,
    post: 'DH4PQzyRlJa',
  },
  {
    slug: 'vestido-boho-curto-verde',
    name: 'Vestido boho curto com babados',
    category: 'vestidos',
    season: 'primavera-verao',
    description:
      'Vestido curto boho, leve e solto, com babados no busto e na barra. No post, acinturado com cinto boho de couro.',
    captionBased: true,
    price: 26990,
    colors: ['Verde-esmeralda'],
    images: 1,
    post: 'DHJFuTfO76_',
  },
  {
    slug: 'vestido-boho-chilli',
    name: 'Vestido boho chilli',
    category: 'vestidos',
    season: 'primavera-verao',
    description: 'Vestido boho curto em tom vermelho-chilli, com mangas amplas e babados.',
    captionBased: true,
    price: 27990,
    colors: ['Vermelho-chilli'],
    images: 1,
    post: 'DH8tonIOItt',
  },
]

export const products: Product[] = seed.map((s) => ({
  ...s,
  id: s.post,
  sizes: s.sizes ?? DEMO_SIZES,
  maxQty: s.maxQty ?? 5,
}))

const bySlug = new Map(products.map((p) => [p.slug, p]))
const byId = new Map(products.map((p) => [p.id, p]))

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug)
}

export function getProductById(id: string): Product | undefined {
  return byId.get(id)
}

export function categoryLabel(id: CategoryId): string {
  return categories.find((c) => c.id === id)?.label ?? id
}

export const instagramPostUrl = (code: string) => `https://www.instagram.com/p/${code}/`
