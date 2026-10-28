import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, CreditCard, Loader2, Lock, MapPin, QrCode, Store, Truck } from 'lucide-react'
import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SunMark } from '../components/Logo'
import { AnimatedNumber } from '../components/motion/animated-number'
import { TransitionPanel } from '../components/motion/transition-panel'
import { ProductImage } from '../components/ProductImage'
import { STORES } from '../data/store'
import { usePageMeta } from '../hooks/usePageMeta'
import { computeTotals } from '../lib/cart'
import {
  cardBrand,
  demoOrderId,
  maskCard,
  maskCEP,
  maskCPF,
  maskExpiry,
  maskPhone,
  onlyDigits,
  shippingFor,
  simulateCardResult,
  simulatedShipping,
  storeById,
  UFS,
  validateAddress,
  validateCard,
  validateCustomer,
  type AddressForm,
  type CardForm,
  type CustomerForm,
  type Delivery,
  type Errors,
} from '../lib/checkout'
import { saveOrder, type DemoOrder } from '../lib/orders'
import { cn, formatBRL } from '../lib/utils'
import { useCart } from '../state/cart'

type Step = 1 | 2 | 3
type Method = 'pix' | 'credito' | 'debito'
const METHODS: { id: Method; label: string; icon: ReactNode }[] = [
  { id: 'pix', label: 'Pix', icon: <QrCode className="h-4 w-4" aria-hidden="true" /> },
  { id: 'credito', label: 'Crédito', icon: <CreditCard className="h-4 w-4" aria-hidden="true" /> },
  { id: 'debito', label: 'Débito', icon: <CreditCard className="h-4 w-4" aria-hidden="true" /> },
]

const emptyCustomer: CustomerForm = { name: '', email: '', phone: '', cpf: '' }
const emptyAddress: AddressForm = { cep: '', street: '', number: '', complement: '', district: '', city: '', state: '', reference: '' }
const emptyCard: Omit<CardForm, 'kind'> = { number: '', holder: '', expiry: '', cvv: '' }

/* ——— campos ——— */

function Field({
  label,
  error,
  optional,
  hint,
  className,
  ...input
}: { label: string; error?: string; optional?: boolean; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional ? <span className="font-normal text-palmeira-2"> (opcional)</span> : <span className="text-alerta" aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-erro` : hint ? `${id}-dica` : undefined}
        required={!optional}
        {...input}
      />
      {hint && !error && (
        <p id={`${id}-dica`} className="mt-1.5 text-xs text-palmeira-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erro`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

function StepBox({
  n,
  title,
  current,
  done,
  summary,
  onEdit,
  children,
}: {
  n: Step
  title: string
  current: boolean
  done: boolean
  summary?: ReactNode
  onEdit?: () => void
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`etapa-${n}`} className={cn('scroll-mt-24 border-t border-linha py-7', current && 'pb-9')}>
      <div className="flex items-center justify-between gap-4">
        <h2 id={`etapa-${n}`} className="flex items-center gap-3 text-2xl">
          <span
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full font-sans text-sm font-semibold',
              current ? 'bg-palmeira text-nuvem' : done ? 'bg-manteiga text-palmeira' : 'bg-linho text-palmeira-2',
            )}
            aria-hidden="true"
          >
            {n}
          </span>
          {title}
        </h2>
        {done && !current && onEdit && (
          <button type="button" onClick={onEdit} className="link text-sm font-semibold">
            Editar<span className="sr-only"> {title.toLowerCase()}</span>
          </button>
        )}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {current ? (
          <motion.div
            key="aberto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        ) : done && summary ? (
          <motion.div key="resumo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 pl-11 text-[0.95rem] text-palmeira-2">
            {summary}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function focusFirstError(root: HTMLElement | null) {
  window.setTimeout(() => root?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0)
}

/* ——— página ——— */

export default function CheckoutPage() {
  usePageMeta('Checkout')
  const { lines, priced, totals: cartTotals, clear } = useCart()
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<Step>(1)
  const [maxStep, setMaxStep] = useState<Step>(1)
  const [customer, setCustomer] = useState(emptyCustomer)
  const [customerErr, setCustomerErr] = useState<Errors<CustomerForm>>({})
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [deliveryErr, setDeliveryErr] = useState<string | null>(null)
  const [address, setAddress] = useState(emptyAddress)
  const [addressErr, setAddressErr] = useState<Errors<AddressForm>>({})
  const [cepState, setCepState] = useState<'idle' | 'loading' | 'ok' | 'erro' | 'nao-encontrado'>('idle')
  const [method, setMethod] = useState<Method>('pix')
  const [card, setCard] = useState(emptyCard)
  const [cardErr, setCardErr] = useState<Errors<CardForm>>({})
  const [payState, setPayState] = useState<'idle' | 'processando' | 'recusado' | 'falha'>('idle')

  const shipping = shippingFor(delivery, address.cep)
  const totals = computeTotals(lines, shipping)
  const ship = simulatedShipping(address.cep)

  // avisa antes de sair da página com dados preenchidos
  const dirty = !!(customer.name || customer.email || address.cep || card.number)
  useEffect(() => {
    if (!dirty || priced.length === 0) return
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBefore)
    return () => window.removeEventListener('beforeunload', onBefore)
  }, [dirty, priced.length])

  // consulta pública de CEP (ViaCEP); o preenchimento manual continua possível
  const lastCep = useRef('')
  useEffect(() => {
    const cep = onlyDigits(address.cep)
    if (cep.length !== 8 || cep === lastCep.current || delivery?.mode !== 'entrega') return
    lastCep.current = cep
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 6000)
    setCepState('loading')
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then((d: { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => {
        if (d.erro) throw new Error('nao-encontrado')
        setAddress((a) => ({
          ...a,
          street: d.logradouro || a.street,
          district: d.bairro || a.district,
          city: d.localidade || a.city,
          state: d.uf || a.state,
        }))
        setAddressErr((e) => ({ ...e, cep: undefined, street: undefined, district: undefined, city: undefined, state: undefined }))
        setCepState('ok')
      })
      .catch((err: Error) => setCepState(err.message === 'nao-encontrado' ? 'nao-encontrado' : 'erro'))
      .finally(() => window.clearTimeout(timer))
    return () => {
      ctrl.abort()
      window.clearTimeout(timer)
    }
  }, [address.cep, delivery?.mode])

  if (priced.length === 0) {
    return (
      <div className="wrap flex flex-col items-center py-24 text-center" data-testid="checkout-vazio">
        <SunMark className="h-16 w-16 text-palmeira" />
        <h1 className="mt-6 text-4xl">Não há peças para finalizar</h1>
        <p className="mt-3 max-w-[40ch] text-palmeira-2">Adicione peças à sacola para seguir com o pedido.</p>
        <Link to="/produtos" className="btn btn-primary mt-8">
          Ver a coleção
        </Link>
      </div>
    )
  }

  const go = (s: Step) => {
    setStep(s)
    setMaxStep((m) => (s > m ? s : m))
    window.setTimeout(() => document.getElementById(`etapa-${s}`)?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const submitCustomer = () => {
    const e = validateCustomer(customer)
    setCustomerErr(e)
    if (Object.keys(e).length) return focusFirstError(formRef.current)
    go(2)
  }

  const submitDelivery = () => {
    if (!delivery) {
      setDeliveryErr('Escolha como quer receber o pedido.')
      return
    }
    setDeliveryErr(null)
    if (delivery.mode === 'entrega') {
      const e = validateAddress(address)
      setAddressErr(e)
      if (Object.keys(e).length) return focusFirstError(formRef.current)
    }
    go(3)
  }

  const createOrder = (status: DemoOrder['status'], m: Method, last4?: string): DemoOrder => {
    const order: DemoOrder = {
      id: demoOrderId(),
      createdAt: new Date().toISOString(),
      lines,
      totals,
      method: m,
      cardLast4: last4,
      status,
      customerFirstName: customer.name.trim().split(/\s+/)[0],
      delivery:
        delivery?.mode === 'retirada'
          ? { mode: 'retirada', store: storeById(delivery.storeId)?.address ?? '' }
          : { mode: 'entrega', city: address.city, state: address.state },
    }
    saveOrder(order)
    return order
  }

  const finish = (order: DemoOrder) => {
    clear()
    navigate(`/pedido/${order.id}`, { replace: true })
  }

  const payPix = () => {
    const order = createOrder('aguardando-pix', 'pix')
    finish(order)
  }

  const payCard = async () => {
    const kind = method === 'debito' ? 'debito' : 'credito'
    const e = validateCard({ ...card, kind })
    setCardErr(e)
    if (Object.keys(e).length) return focusFirstError(formRef.current)
    setPayState('processando')
    try {
      await new Promise((r) => window.setTimeout(r, 1300))
      const digits = onlyDigits(card.number)
      if (digits.endsWith('0119')) throw new Error('falha simulada')
      const result = simulateCardResult(digits)
      const last4 = digits.slice(-4)
      if (result === 'recusado') {
        setPayState('recusado')
        setCard((c) => ({ ...c, cvv: '' }))
        return
      }
      // os dados do cartão são descartados aqui: só os 4 últimos dígitos seguem para a tela de confirmação
      setCard(emptyCard)
      finish(createOrder('aprovado-simulado', method, last4))
    } catch {
      setPayState('falha')
    }
  }

  const brand = cardBrand(card.number)

  return (
    <div className="wrap pt-10" ref={formRef}>
      <nav aria-label="Trilha" className="text-sm text-palmeira-2">
        <Link to="/sacola" className="link">
          Sacola
        </Link>{' '}
        / <span aria-current="page">Checkout</span>
      </nav>
      <h1 className="mt-3 text-4xl sm:text-5xl">Finalizar pedido</h1>
      <p className="mt-3 flex items-start gap-2 text-sm text-palmeira-2">
        <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Checkout demonstrativo: nenhum dado é enviado e nenhum valor é cobrado. Campos com <span className="text-alerta">*</span> são obrigatórios.
        </span>
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          {/* 1 — dados */}
          <StepBox
            n={1}
            title="Seus dados"
            current={step === 1}
            done={maxStep > 1}
            onEdit={() => setStep(1)}
            summary={
              <span className="flex flex-col">
                <span>{customer.name}</span>
                <span>{customer.email}</span>
                <span>{customer.phone}</span>
              </span>
            }
          >
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                submitCustomer()
              }}
              className="grid gap-5 sm:grid-cols-2"
            >
              <Field
                className="sm:col-span-2"
                label="Nome completo" name="nome"
                autoComplete="name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                error={customerErr.name}
              />
              <Field
                label="E-mail" name="email" spellCheck={false}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                error={customerErr.email}
              />
              <Field
                label="Celular com DDD" name="celular"
                type="tel"
                autoComplete="tel-national"
                inputMode="tel"
                placeholder="(35) 99999-9999"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: maskPhone(e.target.value) })}
                error={customerErr.phone}
              />
              <Field
                label="CPF" name="cpf" spellCheck={false}
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={customer.cpf}
                onChange={(e) => setCustomer({ ...customer, cpf: maskCPF(e.target.value) })}
                error={customerErr.cpf}
                hint="Usado na nota fiscal. Use um CPF fictício válido nos testes."
              />
              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  Continuar para recebimento
                </button>
              </div>
            </form>
          </StepBox>

          {/* 2 — recebimento */}
          <StepBox
            n={2}
            title="Recebimento"
            current={step === 2}
            done={maxStep > 2}
            onEdit={() => setStep(2)}
            summary={
              delivery?.mode === 'retirada' ? (
                <>Retirada na loja: {storeById(delivery.storeId)?.address}</>
              ) : (
                <>
                  Entrega em {address.street}, {address.number}, {address.district}, {address.city}/{address.state}
                </>
              )
            }
          >
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                submitDelivery()
              }}
            >
              <fieldset>
                <legend className="sr-only">Como você quer receber</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={cn('flex cursor-pointer gap-3 rounded-xl border bg-white p-4 transition', delivery?.mode === 'entrega' ? 'border-palmeira ring-1 ring-palmeira' : 'border-linha hover:border-palmeira/50')}>
                    <input type="radio" name="recebimento" className="mt-1 h-4 w-4 accent-palmeira" checked={delivery?.mode === 'entrega'} onChange={() => setDelivery({ mode: 'entrega' })} />
                    <span>
                      <span className="flex items-center gap-2 font-semibold">
                        <Truck className="h-4 w-4" aria-hidden="true" /> Entrega no endereço
                      </span>
                      <span className="mt-1 block text-sm text-palmeira-2">Para todo o Brasil. Frete simulado pelo CEP.</span>
                    </span>
                  </label>
                  <label className={cn('flex cursor-pointer gap-3 rounded-xl border bg-white p-4 transition', delivery?.mode === 'retirada' ? 'border-palmeira ring-1 ring-palmeira' : 'border-linha hover:border-palmeira/50')}>
                    <input type="radio" name="recebimento" className="mt-1 h-4 w-4 accent-palmeira" checked={delivery?.mode === 'retirada'} onChange={() => setDelivery({ mode: 'retirada', storeId: STORES[0].id })} />
                    <span>
                      <span className="flex items-center gap-2 font-semibold">
                        <Store className="h-4 w-4" aria-hidden="true" /> Retirar em Lavras
                      </span>
                      <span className="mt-1 block text-sm text-palmeira-2">Em uma das duas lojas. Opção demonstrativa, confirme com a loja.</span>
                    </span>
                  </label>
                </div>
                {deliveryErr && (
                  <p className="field-error" role="alert">
                    {deliveryErr}
                  </p>
                )}
              </fieldset>

              <AnimatePresence initial={false} mode="wait">
                {delivery?.mode === 'entrega' && (
                  <motion.div key="end" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="grid gap-5 pt-6 sm:grid-cols-6">
                      <div className="sm:col-span-2">
                        <Field
                          label="CEP" name="cep"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="00000-000"
                          value={address.cep}
                          onChange={(e) => {
                            setAddress({ ...address, cep: maskCEP(e.target.value) })
                            setCepState('idle')
                          }}
                          error={addressErr.cep}
                        />
                        <p className="mt-1.5 min-h-5 text-xs text-palmeira-2" aria-live="polite">
                          {cepState === 'loading' && (
                            <span className="inline-flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Buscando endereço…
                            </span>
                          )}
                          {cepState === 'ok' && 'Endereço preenchido pelo CEP. Confira.'}
                          {cepState === 'erro' && 'Não foi possível buscar o CEP. Preencha o endereço manualmente.'}
                          {cepState === 'nao-encontrado' && 'CEP não encontrado. Confira o número ou preencha o endereço manualmente.'}
                        </p>
                      </div>
                      <Field className="sm:col-span-4" label="Rua ou avenida" name="rua" autoComplete="address-line1" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} error={addressErr.street} />
                      <Field className="sm:col-span-2" label="Número" name="numero" inputMode="numeric" value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} error={addressErr.number} />
                      <Field className="sm:col-span-4" label="Complemento" name="complemento" optional autoComplete="address-line2" value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
                      <Field className="sm:col-span-3" label="Bairro" name="bairro" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} error={addressErr.district} />
                      <Field className="sm:col-span-2" label="Cidade" name="cidade" autoComplete="address-level2" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} error={addressErr.city} />
                      <div className="sm:col-span-1">
                        <label htmlFor="uf" className="field-label">
                          UF<span className="text-alerta" aria-hidden="true"> *</span>
                        </label>
                        <select
                          id="uf"
                          name="uf"
                          className="field"
                          autoComplete="address-level1"
                          value={address.state}
                          aria-invalid={addressErr.state ? true : undefined}
                          aria-describedby={addressErr.state ? 'uf-erro' : undefined}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        >
                          <option value="">—</option>
                          {UFS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        {addressErr.state && (
                          <p id="uf-erro" className="field-error">
                            {addressErr.state}
                          </p>
                        )}
                      </div>
                      <Field className="sm:col-span-6" label="Ponto de referência" name="referencia" optional value={address.reference} onChange={(e) => setAddress({ ...address, reference: e.target.value })} />
                      {ship && (
                        <p className="flex items-center gap-2 rounded-lg bg-ceu px-4 py-3 text-sm sm:col-span-6" data-testid="frete-simulado">
                          <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>
                            Frete {ship.label}: <strong>{formatBRL(ship.cents)}</strong>. Valor fictício, não é tabela da loja.
                          </span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
                {delivery?.mode === 'retirada' && (
                  <motion.fieldset key="ret" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <legend className="sr-only">Escolha a loja</legend>
                    <div className="space-y-2 pt-6">
                      {STORES.map((s) => (
                        <label key={s.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-1">
                          <input type="radio" name="loja" className="h-4 w-4 accent-palmeira" checked={delivery.storeId === s.id} onChange={() => setDelivery({ mode: 'retirada', storeId: s.id })} />
                          <MapPin className="h-4 w-4 text-palmeira-2" aria-hidden="true" />
                          {s.address}
                        </label>
                      ))}
                    </div>
                  </motion.fieldset>
                )}
              </AnimatePresence>

              <button type="submit" className="btn btn-primary mt-7 w-full sm:w-auto">
                Continuar para pagamento
              </button>
            </form>
          </StepBox>

          {/* 3 — pagamento */}
          <StepBox n={3} title="Pagamento" current={step === 3} done={false}>
            <div className="mb-6 rounded-lg border border-manteiga bg-manteiga-claro px-4 py-3 text-sm">
              Pagamento simulado. Nenhuma cobrança real é feita e os dados do cartão não saem deste navegador.
            </div>
            <div role="tablist" aria-label="Forma de pagamento" className="grid grid-cols-3 gap-1 rounded-full border border-linha bg-white p-1">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  id={`aba-${m.id}`}
                  aria-selected={method === m.id}
                  aria-controls="painel-pagamento"
                  onClick={() => {
                    setMethod(m.id)
                    setPayState('idle')
                  }}
                  className={cn(
                    'inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors',
                    method === m.id ? 'bg-palmeira text-nuvem' : 'text-palmeira-2 hover:text-palmeira',
                  )}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            <div id="painel-pagamento" role="tabpanel" aria-labelledby={`aba-${method}`} className="mt-6">
              <TransitionPanel
                activeIndex={method === 'pix' ? 0 : 1}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                variants={{ enter: { opacity: 0, y: 8 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}
              >
                {[
                  <div key="pix" className="space-y-4">
                    <p className="text-palmeira-2">
                      Ao confirmar, mostramos um QR Code e um código “copia e cola” de demonstração. Eles não funcionam em nenhum banco.
                    </p>
                    <button type="button" onClick={payPix} className="btn btn-primary w-full" data-testid="pagar-pix">
                      Gerar Pix de demonstração ({formatBRL(totals.total)})
                    </button>
                  </div>,
                  <form
                    key="cartao"
                    noValidate
                    autoComplete="off"
                    onSubmit={(e) => {
                      e.preventDefault()
                      payCard()
                    }}
                    className="grid gap-5 sm:grid-cols-4"
                  >
                    <Field
                      className="sm:col-span-4"
                      label={`Número do cartão de ${method === 'debito' ? 'débito' : 'crédito'}`}
                      name="cartao"
                      spellCheck={false}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="0000 0000 0000 0000"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: maskCard(e.target.value) })}
                      error={cardErr.number}
                      hint={brand ? `Bandeira: ${brand}` : 'Teste: 4111 1111 1111 1111 aprova; final 0002 recusa; final 0119 simula falha.'}
                    />
                    <Field className="sm:col-span-4" label="Nome impresso no cartão" name="titular" spellCheck={false} autoComplete="off" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value.toUpperCase() })} error={cardErr.holder} />
                    <Field className="sm:col-span-2" label="Validade" name="validade" inputMode="numeric" placeholder="MM/AA" autoComplete="off" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: maskExpiry(e.target.value) })} error={cardErr.expiry} />
                    <Field
                      className="sm:col-span-2"
                      label="Código de segurança" name="cvv"
                      inputMode="numeric"
                      placeholder="CVV"
                      autoComplete="off"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: onlyDigits(e.target.value).slice(0, 4) })}
                      error={cardErr.cvv}
                    />
                    <AnimatePresence>
                      {(payState === 'recusado' || payState === 'falha') && (
                        <motion.div
                          role="alert"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex gap-3 rounded-lg bg-alerta/10 px-4 py-3 text-sm text-alerta sm:col-span-4"
                          data-testid={payState === 'recusado' ? 'pagamento-recusado' : 'pagamento-falha'}
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          {payState === 'recusado' ? (
                            <span>
                              <strong>Pagamento simulado recusado.</strong> Confira os dados, digite o código de segurança de novo ou use outro cartão. Seus dados de entrega foram mantidos.
                            </span>
                          ) : (
                            <span>
                              <strong>Falha inesperada na simulação.</strong> Nada foi cobrado. Tente de novo em instantes.
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button type="submit" disabled={payState === 'processando'} className="btn btn-primary w-full sm:col-span-4" data-testid="pagar-cartao">
                      {payState === 'processando' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Processando simulação…
                        </>
                      ) : (
                        `Simular pagamento de ${formatBRL(totals.total)}`
                      )}
                    </button>
                  </form>,
                ]}
              </TransitionPanel>
            </div>
          </StepBox>
        </div>

        {/* resumo */}
        <aside className="lg:col-span-5" aria-labelledby="titulo-resumo-pedido">
          <div className="rounded-2xl bg-ceu p-6 lg:sticky lg:top-28">
            <h2 id="titulo-resumo-pedido" className="text-2xl">
              Seu pedido
            </h2>
            <ul className="mt-5 space-y-4">
              {priced.map((l) => (
                <li key={l.key} className="flex gap-3">
                  <div className="w-14 shrink-0 overflow-hidden rounded-md">
                    <ProductImage slug={l.product.slug} alt="" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium leading-snug">{l.product.name}</p>
                    <p className="text-palmeira-2">
                      {l.color}, {l.size}, {l.qty} un.
                    </p>
                  </div>
                  <p className="text-sm">{formatBRL(l.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2.5 border-t border-palmeira/15 pt-5 text-[0.95rem]">
              <div className="flex justify-between">
                <dt className="text-palmeira-2">Subtotal</dt>
                <dd className="" data-testid="resumo-subtotal">
                  {formatBRL(cartTotals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-palmeira-2">Frete</dt>
                <dd className="text-right" data-testid="resumo-frete">
                  {!delivery ? 'escolha o recebimento' : delivery.mode === 'retirada' ? 'grátis (retirada)' : ship ? `${formatBRL(ship.cents)} (simulado)` : 'informe o CEP'}
                </dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-palmeira-2">Desconto</dt>
                  <dd className="">−{formatBRL(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-palmeira-2">Pagamento</dt>
                <dd>{maxStep === 3 ? METHODS.find((m) => m.id === method)!.label : 'a escolher'}</dd>
              </div>
              <div className="flex justify-between border-t border-palmeira/15 pt-3 text-lg font-semibold">
                <dt>Total</dt>
                <dd data-testid="resumo-total">
                  <AnimatedNumber value={totals.total / 100} format={(v) => formatBRL(Math.round(v * 100))} />
                </dd>
              </div>
            </dl>
            <Link to="/sacola" className="link mt-5 inline-block text-sm">
              Alterar peças na sacola
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
