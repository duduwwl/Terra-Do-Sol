import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { STORE } from '../data/store'
import { usePageMeta } from '../hooks/usePageMeta'

export default function AboutDemoPage() {
  usePageMeta('Sobre esta demonstração')
  const confirmedPrices = products.filter((p) => p.priceConfirmed).length
  return (
    <div className="wrap pt-12">
      <article className="max-w-[68ch]">
        <h1 className="text-4xl sm:text-5xl">Sobre esta demonstração</h1>
        <p className="mt-6 text-lg text-palmeira-2">
          Este site mostra como seria uma loja virtual da Terra do Sol. Ele foi montado com as publicações do Instagram{' '}
          <a href={STORE.instagram} target="_blank" rel="noreferrer" className="link text-palmeira">
            {STORE.instagramHandle}
          </a>{' '}
          e não está ligado ao estoque nem ao caixa da loja.
        </p>

        <h2 className="mt-12 text-2xl">O que é real</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-palmeira-2">
          <li>As fotos e descrições das {products.length} peças, tiradas das publicações da loja (cada página de produto tem o link do post).</li>
          <li>Os endereços das duas lojas em Lavras, o telefone fixo, o WhatsApp e a informação de envio para todo o Brasil.</li>
          <li>Cores e tamanhos quando a própria legenda informa (as páginas indicam quando é o caso).</li>
          <li>O preço de {confirmedPrices} peça, divulgado pela loja no Instagram.</li>
        </ul>

        <h2 className="mt-10 text-2xl">O que é simulado</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-palmeira-2">
          <li>Os demais preços, a grade de tamanhos e a disponibilidade.</li>
          <li>O frete (valores fictícios por região) e a retirada na loja.</li>
          <li>Os pagamentos por Pix e cartão: nenhum valor é cobrado, o QR Code não é um Pix válido e os dados do cartão não saem do navegador.</li>
          <li>Os pedidos: ficam só nesta aba do navegador e a loja não os recebe.</li>
        </ul>

        <h2 className="mt-10 text-2xl">Cartões de teste</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-palmeira-2">
          <li>4111 1111 1111 1111: pagamento simulado aprovado.</li>
          <li>4000 0000 0000 0002: pagamento simulado recusado.</li>
          <li>4000 0000 0000 0119: falha inesperada simulada.</li>
          <li>Use qualquer validade futura e um código de 3 dígitos.</li>
        </ul>

        <Link to="/produtos" className="btn btn-primary mt-12">
          Ver a coleção
        </Link>
      </article>
    </div>
  )
}
