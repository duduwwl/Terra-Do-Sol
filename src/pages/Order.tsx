import { motion } from 'motion/react'
import { Check, Clock, Copy, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SunMark } from '../components/Logo'
import { getProductById } from '../data/products'
import { STORE } from '../data/store'
import { usePageMeta } from '../hooks/usePageMeta'
import { demoPixCode } from '../lib/checkout'
import { getOrder, updateOrder, type DemoOrder } from '../lib/orders'
import { formatBRL } from '../lib/utils'

const METHOD_LABEL: Record<DemoOrder['method'], string> = { pix: 'Pix', credito: 'Cartão de crédito', debito: 'Cartão de débito' }

export default function OrderPage() {
  const { id = '' } = useParams()
  const [order, setOrder] = useState<DemoOrder | undefined>(() => getOrder(id))
  usePageMeta(order ? `Pedido ${order.id}` : 'Pedido não encontrado')

  if (!order) {
    return (
      <div className="wrap flex flex-col items-center py-24 text-center">
        <SunMark className="h-16 w-16 text-palmeira" />
        <h1 className="mt-6 text-4xl">Pedido não encontrado</h1>
        <p className="mt-3 max-w-[46ch] text-palmeira-2">
          Pedidos de demonstração ficam guardados só nesta aba do navegador. Se você fechou a aba, o pedido {id} não está mais disponível.
        </p>
        <Link to="/produtos" className="btn btn-primary mt-8">
          Voltar para a coleção
        </Link>
      </div>
    )
  }

  const refresh = () => setOrder(getOrder(id))

  return (
    <div className="wrap pt-12">
      <div className="mx-auto max-w-3xl">
        {order.status === 'aguardando-pix' ? (
          <PixWaiting order={order} onPaid={refresh} />
        ) : (
          <Confirmed order={order} />
        )}
        <OrderDetails order={order} />
      </div>
    </div>
  )
}

function PixWaiting({ order, onPaid }: { order: DemoOrder; onPaid: () => void }) {
  const code = demoPixCode(order.id, order.totals.total)
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(code, { margin: 1, width: 440, color: { dark: '#1f3529', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(null))
  }, [code])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  const simulatePaid = () => {
    setConfirming(true)
    window.setTimeout(() => {
      updateOrder(order.id, { status: 'pago-simulado' })
      onPaid()
    }, 1200)
  }

  return (
    <section aria-labelledby="titulo-pix" data-testid="pix-aguardando">
      <p className="inline-flex items-center gap-2 rounded-full bg-manteiga-claro px-3 py-1 text-sm font-semibold">
        <Clock className="h-4 w-4" aria-hidden="true" /> Pedido demonstrativo criado, aguardando Pix simulado
      </p>
      <h1 id="titulo-pix" className="mt-4 text-4xl sm:text-5xl">
        Pague com o Pix de demonstração
      </h1>
      <p className="mt-3 text-palmeira-2">
        Este QR Code e o código abaixo são apenas ilustrativos: não são um Pix válido e não funcionam em nenhum banco.
      </p>

      <div className="mt-8 grid items-start gap-8 rounded-2xl bg-ceu p-6 sm:grid-cols-[13rem_1fr] sm:p-8">
        <div className="relative mx-auto w-52 sm:mx-0">
          {qr ? (
            <img src={qr} alt="QR Code de demonstração, sem valor de pagamento" className="w-full rounded-lg bg-white p-2" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-white text-sm text-palmeira-2">Gerando QR Code…</div>
          )}
          <span className="absolute inset-x-0 -bottom-3 mx-auto w-max rounded-full bg-palmeira px-3 py-1 text-xs font-semibold text-nuvem">DEMONSTRAÇÃO</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-palmeira-2">Valor</p>
          <p className="text-3xl">{formatBRL(order.totals.total)}</p>
          <label htmlFor="pix-codigo" className="field-label mt-5">
            Pix copia e cola (fictício)
          </label>
          <div className="flex gap-2">
            <input id="pix-codigo" readOnly value={code} className="field min-w-0 font-mono text-xs" onFocus={(e) => e.target.select()} />
            <button type="button" onClick={copy} className="btn btn-ghost shrink-0 px-4" data-testid="copiar-pix">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            {copied ? 'Código copiado' : ''}
          </p>
          <button type="button" onClick={simulatePaid} disabled={confirming} className="btn btn-primary mt-6 w-full" data-testid="simular-pix">
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Confirmando simulação…
              </>
            ) : (
              'Simular confirmação do Pix'
            )}
          </button>
        </div>
      </div>
    </section>
  )
}

function Confirmed({ order }: { order: DemoOrder }) {
  return (
    <section aria-labelledby="titulo-confirmado" data-testid="pedido-confirmado">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-manteiga"
        aria-hidden="true"
      >
        <Check className="h-8 w-8" />
      </motion.div>
      <h1 id="titulo-confirmado" className="mt-6 text-4xl sm:text-5xl">
        {order.status === 'pago-simulado' ? 'Pix simulado confirmado' : 'Pagamento simulado aprovado'}
      </h1>
      <p className="mt-3 max-w-[56ch] text-palmeira-2">
        Obrigada, {order.customerFirstName}. Este é um pedido de demonstração: nenhum valor foi cobrado e a loja não recebeu este pedido. Para comprar de verdade, fale com a Terra do Sol{' '}
        <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="link text-palmeira">
          pelo WhatsApp
        </a>
        .
      </p>
    </section>
  )
}

function OrderDetails({ order }: { order: DemoOrder }) {
  return (
    <section className="mt-10 rounded-2xl border border-linha bg-white p-6 sm:p-8" aria-labelledby="titulo-detalhes">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-detalhes" className="text-2xl">
          Resumo do pedido
        </h2>
        <p className="font-mono text-sm" data-testid="numero-pedido">
          {order.id}
        </p>
      </div>
      <ul className="mt-5 divide-y divide-linha">
        {order.lines.map((l) => {
          const p = getProductById(l.productId)
          if (!p) return null
          return (
            <li key={`${l.productId}${l.size}${l.color}`} className="flex justify-between gap-4 py-3 text-[0.95rem]">
              <span>
                {p.name}
                <span className="block text-sm text-palmeira-2">
                  {l.color}, {l.size}, {l.qty} un.
                </span>
              </span>
              <span className="">{formatBRL(p.price * l.qty)}</span>
            </li>
          )
        })}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-linha pt-4 text-[0.95rem]">
        <div className="flex justify-between">
          <dt className="text-palmeira-2">Subtotal</dt>
          <dd className="">{formatBRL(order.totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-palmeira-2">Frete</dt>
          <dd className="">{order.totals.shipping ? `${formatBRL(order.totals.shipping)} (simulado)` : 'grátis'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-palmeira-2">Recebimento</dt>
          <dd className="text-right">{order.delivery.mode === 'retirada' ? `Retirada: ${order.delivery.store}` : `Entrega em ${order.delivery.city}/${order.delivery.state}`}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-palmeira-2">Pagamento</dt>
          <dd>
            {METHOD_LABEL[order.method]}
            {order.cardLast4 ? ` final ${order.cardLast4}` : ''} (simulado)
          </dd>
        </div>
        <div className="flex justify-between border-t border-linha pt-3 text-lg font-semibold">
          <dt>Total</dt>
          <dd className="" data-testid="pedido-total">
            {formatBRL(order.totals.total)}
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-xs text-palmeira-2">Documento sem valor fiscal ou financeiro. Gerado apenas para demonstração.</p>
      <Link to="/produtos" className="btn btn-ghost mt-6">
        Voltar para a coleção
      </Link>
    </section>
  )
}
