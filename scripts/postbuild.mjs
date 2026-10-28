// Gera o sitemap a partir do catálogo, depois do build.
import { writeFileSync } from 'node:fs'
const { products, categories } = await import('../src/data/products.ts')
const base = 'https://duduwwl.github.io/Terra-Do-Sol'
const urls = ['/', '/produtos', ...categories.map((c) => `/produtos?categoria=${c.id}`), ...products.map((p) => `/produto/${p.slug}`), '/sobre-a-demonstracao']
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url><loc>${base}${u.replace(/&/g, '&amp;')}</loc></url>`)
  .join('\n')}\n</urlset>\n`
writeFileSync('dist/sitemap.xml', xml)
console.log(`sitemap.xml: ${urls.length} URLs`)
