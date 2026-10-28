# Terra do Sol — loja virtual demonstrativa

E-commerce de demonstração para a **Terra do Sol**, boutique de moda feminina em Lavras-MG desde 1988
([@terradosol_lavras](https://www.instagram.com/terradosol_lavras/)).

**Site publicado:** https://duduwwl.github.io/Terra-Do-Sol/

> Demonstração: fotos e descrições vêm do Instagram da loja; preços (salvo um), tamanhos, estoque, frete e
> pagamentos são simulados. Nenhum valor é cobrado e nenhum pedido chega à loja.

## O que tem

- **Início** com abertura, categorias, novidades, destaque “amarelo-manteiga” e informações das lojas.
- **Catálogo** (`/produtos`) com busca sem acento, categorias, filtros por estação, cor e novidades,
  ordenação por preço e nome, “mostrar mais”, estado vazio e filtros guardados na URL.
- **Produto** (`/produto/:slug`) com galeria (miniaturas no desktop, deslize no celular), cor, tamanho,
  quantidade validados antes de adicionar.
- **Sacola** (gaveta lateral e página `/sacola`): alterar quantidade, remover com “desfazer”, limite por
  pedido, subtotal por item, persistência no `localStorage` (só id, variação e quantidade).
- **Checkout** (`/checkout`) em três etapas: dados (nome, e-mail, celular, CPF validado), recebimento
  (entrega com consulta de CEP no ViaCEP e preenchimento manual, ou retirada em uma das duas lojas) e pagamento.
- **Pagamentos simulados**: Pix (QR Code e “copia e cola” marcados como demonstração, espera e confirmação
  simulada) e cartão de crédito/débito (Luhn, validade, CVV; recusa e falha simuladas).
- Página `/sobre-a-demonstracao` explicando o que é real e o que é simulado.

### Cartões de teste

| Número | Resultado |
| --- | --- |
| 4111 1111 1111 1111 | aprovado (simulado) |
| 4000 0000 0000 0002 | recusado (simulado) |
| 4000 0000 0000 0119 | falha inesperada (simulada) |

Qualquer validade futura e CVV de 3 dígitos. Os dados do cartão nunca são gravados nem enviados;
o pedido guarda só os 4 últimos dígitos.

## Tecnologias

React 18, TypeScript, Vite 8, Tailwind CSS 4, React Router 6, Motion (motion.dev), lucide-react, qrcode.
Componentes de animação adaptados do **Motion Primitives** (MIT): `AnimatedBackground` (seletores de
categoria e tamanho), `SlidingNumber` (contador da sacola), `AnimatedNumber` (totais), `InView`
(revelação da seção amarelo-manteiga) e `TransitionPanel` (troca entre Pix e cartão).
Fancy Components, UI Watermelon e Canvas UI foram avaliados e não usados (ver relatório no fim).

Testes: Vitest (regras de sacola, catálogo e checkout), Playwright (jornada completa em desktop e celular)
e axe-core (acessibilidade).

## Estrutura

```
src/
  data/products.ts      catálogo (48 peças) com origem de cada informação
  data/store.ts         endereços, telefone e WhatsApp oficiais
  lib/cart.ts           regras da sacola (puras, testadas)
  lib/catalog.ts        busca, filtros e ordenação
  lib/checkout.ts       validações, máscaras, frete simulado, pagamento simulado
  lib/orders.ts         pedidos de demonstração (sessionStorage)
  state/cart.tsx        contexto React da sacola
  components/           cabeçalho, rodapé, gaveta, cartões, painel lateral, motion/
  pages/                Home, Catalog, Product, Cart, Checkout, Order, AboutDemo, NotFound
public/img/p/           fotos dos produtos em WebP (480 e 960 px, recorte 4:5)
public/404.html         redireciona rotas internas no GitHub Pages
scripts/build-images.mjs  gera as fotos otimizadas a partir das originais
docs/inventario.md      inventário de produtos e pendências
e2e/                    testes Playwright
```

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:5173/Terra-Do-Sol/
```

## Testes e build

```bash
npm run lint
npm test             # Vitest
npm run build        # tsc + vite build + sitemap
npx playwright install chromium   # primeira vez
npm run test:e2e     # sobe o preview e roda os testes Playwright
```

Para testar a versão publicada: `E2E_BASE_URL=https://duduwwl.github.io/Terra-Do-Sol/ npm run test:e2e`.

## Publicação

O workflow `.github/workflows/deploy.yml` roda lint, testes e build a cada push na `main` e publica `dist/`
no GitHub Pages (Settings → Pages → Source: **GitHub Actions**). O caminho-base `/Terra-Do-Sol/` está em
`vite.config.ts`, `public/404.html` e `index.html`; se o repositório mudar de nome, ajuste os três.

As rotas internas (`/produtos`, `/checkout`…) funcionam ao abrir direto ou recarregar: o `404.html` guarda a
rota pedida e volta para a raiz, que restaura o endereço antes de o React iniciar.

## Fotos

As fotos originais foram baixadas do Instagram da loja (com autorização do responsável pelo projeto) e não
ficam no repositório. Para regenerar as versões otimizadas:

```bash
npm run images -- caminho/para/fotos-originais
```

## Pendências com a loja

Preços, tamanhos e medidas, estoque, frete, prazos, trocas, retirada pelo site, horário de funcionamento e
logotipo em alta resolução. Detalhes em `docs/inventario.md`.
