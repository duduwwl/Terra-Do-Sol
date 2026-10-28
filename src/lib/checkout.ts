/**
 * Validações e regras do checkout demonstrativo.
 * Nada aqui envia dados para fora do navegador (exceto a consulta pública de CEP).
 */
import { STORES } from '../data/store'

export const onlyDigits = (s: string) => s.replace(/\D/g, '')

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

/** Telefone brasileiro com DDD: 10 (fixo) ou 11 dígitos (celular iniciando com 9). */
export function isValidPhone(phone: string) {
  const d = onlyDigits(phone)
  if (d.length === 10) return /^[1-9]{2}[2-8]\d{7}$/.test(d)
  if (d.length === 11) return /^[1-9]{2}9\d{8}$/.test(d)
  return false
}

export function isValidCEP(cep: string) {
  return /^\d{8}$/.test(onlyDigits(cep))
}

export function isValidCPF(cpf: string) {
  const d = onlyDigits(cpf)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10])
}

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskCEP(v: string) {
  const d = onlyDigits(v).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function maskCard(v: string) {
  return onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function maskExpiry(v: string) {
  const d = onlyDigits(v).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function luhn(num: string) {
  const d = onlyDigits(num)
  if (d.length < 13 || d.length > 19) return false
  let sum = 0
  let dbl = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i])
    if (dbl) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    dbl = !dbl
  }
  return sum % 10 === 0
}

export function isValidExpiry(v: string, now = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v.trim())
  if (!m) return false
  const month = Number(m[1])
  const year = 2000 + Number(m[2])
  if (month < 1 || month > 12) return false
  const endOfMonth = new Date(year, month, 1)
  return endOfMonth > now && year <= now.getFullYear() + 20
}

export function isValidCVV(v: string) {
  return /^\d{3,4}$/.test(v)
}

export function cardBrand(num: string): string | null {
  const d = onlyDigits(num)
  if (/^4/.test(d)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'American Express'
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d)) return 'Elo'
  return null
}

/* ——— Recebimento ——— */

export type Delivery = { mode: 'entrega' } | { mode: 'retirada'; storeId: string }

/**
 * Frete SIMULADO. A loja informa que envia para todo o Brasil, mas não
 * publica tabela de frete. Estes valores existem apenas para a demonstração.
 */
export function simulatedShipping(cep: string): { cents: number; label: string } | null {
  const d = onlyDigits(cep)
  if (d.length !== 8) return null
  const n = Number(d.slice(0, 5))
  if (n >= 37200 && n <= 37209) return { cents: 1200, label: 'Lavras (simulação)' }
  if (Number(d[0]) === 3) return { cents: 2490, label: 'Minas Gerais (simulação)' }
  return { cents: 3490, label: 'Demais estados (simulação)' }
}

export function shippingFor(delivery: Delivery | null, cep: string): number {
  if (!delivery || delivery.mode === 'retirada') return 0
  return simulatedShipping(cep)?.cents ?? 0
}

export function storeById(id: string) {
  return STORES.find((s) => s.id === id)
}

/* ——— Formulário ——— */

export interface CustomerForm {
  name: string
  email: string
  phone: string
  cpf: string
}

export interface AddressForm {
  cep: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  reference: string
}

export type Errors<T> = Partial<Record<keyof T, string>>

export function validateCustomer(c: CustomerForm): Errors<CustomerForm> {
  const e: Errors<CustomerForm> = {}
  if (c.name.trim().split(/\s+/).filter(Boolean).length < 2) e.name = 'Informe nome e sobrenome.'
  if (!isValidEmail(c.email)) e.email = 'Informe um e-mail válido, como nome@exemplo.com.'
  if (!isValidPhone(c.phone)) e.phone = 'Informe o telefone com DDD, como (35) 99999-9999.'
  if (!isValidCPF(c.cpf)) e.cpf = 'CPF inválido. Confira os 11 dígitos.'
  return e
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
  'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export function validateAddress(a: AddressForm): Errors<AddressForm> {
  const e: Errors<AddressForm> = {}
  if (!isValidCEP(a.cep)) e.cep = 'Informe um CEP com 8 dígitos.'
  if (a.street.trim().length < 3) e.street = 'Informe a rua ou avenida.'
  if (!a.number.trim()) e.number = 'Informe o número (ou "s/n").'
  if (a.district.trim().length < 2) e.district = 'Informe o bairro.'
  if (a.city.trim().length < 2) e.city = 'Informe a cidade.'
  if (!UFS.includes(a.state)) e.state = 'Escolha o estado.'
  return e
}

export interface CardForm {
  kind: 'credito' | 'debito'
  number: string
  holder: string
  expiry: string
  cvv: string
}

export function validateCard(c: CardForm, now = new Date()): Errors<CardForm> {
  const e: Errors<CardForm> = {}
  if (!luhn(c.number)) e.number = 'Número de cartão inválido.'
  if (c.holder.trim().length < 3) e.holder = 'Informe o nome como está no cartão.'
  if (!isValidExpiry(c.expiry, now)) e.expiry = 'Validade inválida ou vencida (MM/AA).'
  if (!isValidCVV(c.cvv)) e.cvv = 'O código tem 3 ou 4 dígitos.'
  return e
}

/** Cartões de teste: terminado em 0002 simula recusa. Nunca há cobrança real. */
export function simulateCardResult(number: string): 'aprovado' | 'recusado' {
  return onlyDigits(number).endsWith('0002') ? 'recusado' : 'aprovado'
}

export function demoOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  const rnd = new Uint32Array(6)
  crypto.getRandomValues(rnd)
  for (const r of rnd) s += chars[r % chars.length]
  return `DEMO-${s}`
}

/** Texto do "Pix copia e cola" de demonstração — propositalmente não é um BR Code válido. */
export function demoPixCode(orderId: string, totalCents: number) {
  return `DEMONSTRACAO-SEM-VALOR|TERRA-DO-SOL|${orderId}|${(totalCents / 100).toFixed(2)}|NAO-PAGUE`
}
