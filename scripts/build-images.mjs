// Gera as fotos otimizadas do catálogo a partir das fotos originais do Instagram.
// Uso: node scripts/build-images.mjs <pasta-com-originais>
// Saída: public/img/p/{slug}-{n}-{480|960}.webp  (recorte 4:5)
import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const src = process.argv[2]
if (!src) throw new Error('Informe a pasta com as fotos originais')
const out = 'public/img/p'
mkdirSync(out, { recursive: true })

// slug -> lista de arquivos de origem (na ordem de exibição)
const files = readdirSync(src)
const byPost = (code, exclude = []) => {
  const numbered = files
    .filter((f) => f.startsWith(`terradosol_${code}_`) && /_\d+\.jpg$/.test(f))
    .filter((f) => !exclude.includes(f))
    .sort((a, b) => Number(a.match(/_(\d+)\.jpg$/)[1]) - Number(b.match(/_(\d+)\.jpg$/)[1]))
  if (numbered.length) return numbered
  const cover = files.find((f) => f === `terradosol_${code}_cover.jpg`)
  return cover ? [cover] : []
}

const { products } = await import('../src/data/products.ts')

const special = {
  'blusa-trico-vazado-preta': [...byPost('DaVkuRPEeiy'), 'terradosol_DadokmMhgM2_1.jpg'],
  'blusa-tule-zebra': byPost('DUbRdaNEcwz', ['terradosol_DUbRdaNEcwz_2.jpg']),
}
// pontos focais (fração vertical do recorte) para fotos com rosto/peça em posição específica
const focus = { 'vestido-curto-amarelo-manteiga': 0.35 }

let total = 0
for (const p of products) {
  const list = special[p.slug] ?? byPost(p.post)
  if (list.length !== p.images) {
    console.warn(`! ${p.slug}: catálogo diz ${p.images} fotos, encontrei ${list.length}`)
  }
  for (const [i, f] of list.slice(0, p.images).entries()) {
    const img = sharp(join(src, f)).rotate()
    const { width, height } = await img.metadata()
    // recorte 4:5
    let w = width, h = Math.round(width * 1.25)
    if (h > height) { h = height; w = Math.round(height * 0.8) }
    const left = Math.round((width - w) / 2)
    const fy = focus[p.slug] ?? 0.25
    const top = Math.round((height - h) * fy)
    for (const size of [480, 960]) {
      await sharp(join(src, f))
        .rotate()
        .extract({ left, top, width: w, height: h })
        .resize(size, Math.round(size * 1.25))
        .webp({ quality: size === 480 ? 74 : 78 })
        .toFile(join(out, `${p.slug}-${i + 1}-${size}.webp`))
      total++
    }
  }
}
console.log(`${total} arquivos gerados em ${out}`)
