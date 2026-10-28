import { describe, expect, it } from 'vitest'
import {
  cardBrand,
  demoPixCode,
  isValidCPF,
  isValidEmail,
  isValidExpiry,
  isValidPhone,
  luhn,
  maskCEP,
  maskPhone,
  shippingFor,
  simulateCardResult,
  simulatedShipping,
  validateAddress,
  validateCard,
  validateCustomer,
} from './checkout'

describe('validações do checkout', () => {
  it('e-mail', () => {
    expect(isValidEmail('maria@exemplo.com')).toBe(true)
    expect(isValidEmail('maria@exemplo')).toBe(false)
    expect(isValidEmail('maria exemplo.com')).toBe(false)
  })

  it('telefone com DDD', () => {
    expect(isValidPhone('(35) 99876-5432')).toBe(true)
    expect(isValidPhone('(35) 3821-6058')).toBe(true)
    expect(isValidPhone('99876-5432')).toBe(false)
    expect(isValidPhone('(35) 89876-5432')).toBe(false)
  })

  it('CPF com dígitos verificadores', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true)
    expect(isValidCPF('529.982.247-24')).toBe(false)
    expect(isValidCPF('111.111.111-11')).toBe(false)
  })

  it('máscaras', () => {
    expect(maskPhone('35998765432')).toBe('(35) 99876-5432')
    expect(maskCEP('37200000')).toBe('37200-000')
  })

  it('cartão: Luhn, bandeira, validade e resultado simulado', () => {
    expect(luhn('4111 1111 1111 1111')).toBe(true)
    expect(luhn('4111 1111 1111 1112')).toBe(false)
    expect(cardBrand('4111111111111111')).toBe('Visa')
    expect(cardBrand('5555555555554444')).toBe('Mastercard')
    const now = new Date(2026, 9, 28)
    expect(isValidExpiry('10/26', now)).toBe(true)
    expect(isValidExpiry('09/26', now)).toBe(false)
    expect(isValidExpiry('13/30', now)).toBe(false)
    expect(simulateCardResult('4000000000000002')).toBe('recusado')
    expect(simulateCardResult('4111111111111111')).toBe('aprovado')
  })

  it('formulários retornam erros por campo', () => {
    expect(Object.keys(validateCustomer({ name: 'Maria', email: 'x', phone: '1', cpf: '1' }))).toEqual(['name', 'email', 'phone', 'cpf'])
    expect(validateCustomer({ name: 'Maria Souza', email: 'maria@exemplo.com', phone: '(35) 99876-5432', cpf: '529.982.247-25' })).toEqual({})
    expect(Object.keys(validateAddress({ cep: '1', street: '', number: '', complement: '', district: '', city: '', state: 'XX', reference: '' }))).toHaveLength(6)
    expect(Object.keys(validateCard({ kind: 'credito', number: '4111 1111 1111 1111', holder: 'MARIA S', expiry: '12/30', cvv: '123' }))).toHaveLength(0)
  })

  it('frete simulado por região e retirada grátis', () => {
    expect(simulatedShipping('37200-000')?.cents).toBe(1200)
    expect(simulatedShipping('30130-000')?.cents).toBe(2490)
    expect(simulatedShipping('01310-100')?.cents).toBe(3490)
    expect(simulatedShipping('123')).toBeNull()
    expect(shippingFor({ mode: 'retirada', storeId: 'misseno' }, '01310-100')).toBe(0)
    expect(shippingFor(null, '01310-100')).toBe(0)
  })

  it('o código Pix é identificado como demonstração', () => {
    expect(demoPixCode('DEMO-ABC123', 12345)).toContain('DEMONSTRACAO-SEM-VALOR')
  })
})
