import { expect, test, type Page } from '@playwright/test'

const brl = (s: string | null) => Number((s ?? '').replace(/[^\d,]/g, '').replace(',', '.'))

// ViaCEP responde de forma previsível nos testes (o site também aceita preenchimento manual)
async function mockCep(page: Page, fail = false) {
  await page.route('https://viacep.com.br/**', (route) =>
    fail
      ? route.abort()
      : route.fulfill({
          json: { cep: '37200-000', logradouro: 'Rua Teste', bairro: 'Centro', localidade: 'Lavras', uf: 'MG' },
        }),
  )
}

async function openCart(page: Page) {
  await page.getByTestId('abrir-sacola').click()
  await expect(page.getByRole('dialog', { name: /Sacola/ })).toBeVisible()
}

async function addFirstDress(page: Page) {
  await page.goto('produto/vestido-midi-branco-bordado')
  await page.getByRole('button', { name: 'Tamanho M' }).click()
  await page.getByTestId('adicionar').click()
  await expect(page.getByTestId('adicionar')).toContainText('Adicionado')
}

async function fillCustomer(page: Page) {
  await page.getByLabel(/Nome completo/).fill('Maria Teste Silva')
  await page.getByLabel(/E-mail/).fill('maria.teste@exemplo.com')
  await page.getByLabel(/Celular com DDD/).fill('35998765432')
  await page.getByLabel(/^CPF/).fill('52998224725')
  await page.getByRole('button', { name: 'Continuar para recebimento' }).click()
}

async function fillDelivery(page: Page) {
  await page.getByText('Entrega no endereço').click()
  await page.getByLabel(/^CEP/).fill('37200000')
  await expect(page.getByLabel(/Rua ou avenida/)).toHaveValue('Rua Teste')
  await page.getByLabel(/^Número/).fill('100')
  await page.getByRole('button', { name: 'Continuar para pagamento' }).click()
}

test('jornada completa com Pix demonstrativo', async ({ page, isMobile }) => {
  await mockCep(page)
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Moda feminina em Lavras')

  // catálogo, busca e filtro
  await page.getByRole('link', { name: 'Ver a coleção' }).click()
  await expect(page).toHaveURL(/\/produtos$/)
  await page.getByLabel('Buscar no catálogo').fill('vestido')
  await expect(page.getByTestId('contagem')).toContainText('peças')
  if (isMobile) {
    await page.getByRole('button', { name: /^Filtros/ }).click()
    await page.getByRole('dialog', { name: 'Filtros' }).getByLabel('Branco e off-white').check()
    await page.getByRole('dialog', { name: 'Filtros' }).getByRole('button', { name: /^Ver \d+/ }).click()
  } else {
    await page.getByRole('complementary', { name: 'Filtros' }).getByLabel('Branco e off-white').check()
  }
  await expect(page).toHaveURL(/cor=claros/)
  await page.getByRole('link', { name: /Vestido midi branco bordado/ }).first().click()

  // detalhes, validação de variação e adição
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vestido midi branco bordado')
  await page.getByTestId('adicionar').click()
  await expect(page.getByRole('alert')).toContainText('Escolha um tamanho')
  await page.getByRole('button', { name: 'Tamanho G' }).click()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByTestId('adicionar').click()
  await expect(page.getByTestId('abrir-sacola')).toHaveAccessibleName(/2 itens/)

  // sacola: quantidade e totais
  await openCart(page)
  const unit = 419.9
  await expect(page.getByTestId('subtotal-item')).toHaveText(/839,80/)
  await page.getByRole('dialog').getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(page.getByTestId('subtotal-item')).toHaveText(/1\.259,70/)
  expect(brl(await page.getByTestId('subtotal-item').textContent())).toBeCloseTo(unit * 3, 2)

  // persistência após recarregar
  await page.reload()
  await expect(page.getByTestId('abrir-sacola')).toHaveAccessibleName(/3 itens/)

  // checkout
  await openCart(page)
  await page.getByRole('button', { name: 'Ir para o checkout' }).click()
  await expect(page).toHaveURL(/\/checkout$/)

  // erros de validação sem perder o que foi digitado
  await page.getByLabel(/Nome completo/).fill('Maria')
  await page.getByRole('button', { name: 'Continuar para recebimento' }).click()
  await expect(page.getByText('Informe nome e sobrenome.')).toBeVisible()
  await expect(page.getByText(/Informe um e-mail válido/)).toBeVisible()
  await expect(page.getByLabel(/Nome completo/)).toHaveValue('Maria')

  await fillCustomer(page)
  await page.getByRole('button', { name: 'Continuar para pagamento' }).click()
  await expect(page.getByText('Escolha como quer receber o pedido.')).toBeVisible()
  await fillDelivery(page)

  // frete simulado de Lavras somado ao total
  await expect(page.getByTestId('resumo-frete')).toContainText('12,00')
  await expect(page.getByTestId('resumo-total').locator('.sr-only')).toHaveText(/1\.271,70/)

  await page.getByTestId('pagar-pix').click()
  await expect(page).toHaveURL(/\/pedido\/DEMO-/)
  await expect(page.getByTestId('pix-aguardando')).toBeVisible()
  await expect(page.getByRole('img', { name: /QR Code de demonstração/ })).toBeVisible()
  await expect(page.locator('#pix-codigo')).toHaveValue(/DEMONSTRACAO-SEM-VALOR/)
  await page.getByTestId('simular-pix').click()
  await expect(page.getByTestId('pedido-confirmado')).toContainText('Pix simulado confirmado')
  await expect(page.getByTestId('pedido-total')).toHaveText(/1\.271,70/)

  // a sacola foi esvaziada após o pedido
  await expect(page.getByTestId('abrir-sacola')).toHaveAccessibleName(/0 itens/)
})

test('cartão: recusa simulada, falha e aprovação', async ({ page }) => {
  await mockCep(page)
  await addFirstDress(page)
  await page.goto('checkout')
  await fillCustomer(page)
  await page.getByText('Retirar em Lavras').click()
  await page.locator('main').getByText(/Pç\. Leonardo Venerando/).click()
  await page.getByRole('button', { name: 'Continuar para pagamento' }).click()
  await expect(page.getByTestId('resumo-frete')).toContainText('grátis')

  await page.getByRole('tab', { name: 'Crédito' }).click()
  // validação
  await page.getByTestId('pagar-cartao').click()
  await expect(page.getByText('Número de cartão inválido.')).toBeVisible()

  const number = page.getByLabel(/Número do cartão/)
  await number.fill('4000000000000002')
  await page.getByLabel(/Nome impresso/).fill('Maria T Silva')
  await page.getByLabel(/^Validade/).fill('1230')
  await page.getByLabel(/Código de segurança/).fill('123')
  await page.getByTestId('pagar-cartao').click()
  await expect(page.getByTestId('pagamento-recusado')).toBeVisible()
  await expect(page.getByLabel(/Código de segurança/)).toHaveValue('')

  await number.fill('4000000000000119')
  await page.getByLabel(/Código de segurança/).fill('123')
  await page.getByTestId('pagar-cartao').click()
  await expect(page.getByTestId('pagamento-falha')).toBeVisible()

  await number.fill('4111111111111111')
  await page.getByLabel(/Código de segurança/).fill('123')
  await page.getByTestId('pagar-cartao').click()
  await expect(page.getByTestId('pedido-confirmado')).toContainText('Pagamento simulado aprovado')
  await expect(page.getByText(/final 1111/)).toBeVisible()

  // nenhum dado de cartão fica no armazenamento do navegador
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }))
  expect(storage).not.toContain('4111111111111111')
  expect(storage).not.toContain('"cvv"')
})

test('CEP indisponível permite preenchimento manual', async ({ page }) => {
  await mockCep(page, true)
  await addFirstDress(page)
  await page.goto('checkout')
  await fillCustomer(page)
  await page.getByText('Entrega no endereço').click()
  await page.getByLabel(/^CEP/).fill('01310100')
  await expect(page.getByText(/Preencha o endereço manualmente/)).toBeVisible()
  await page.getByLabel(/Rua ou avenida/).fill('Avenida Paulista')
  await page.getByLabel(/^Número/).fill('1000')
  await page.getByLabel(/^Bairro/).fill('Bela Vista')
  await page.getByLabel(/^Cidade/).fill('São Paulo')
  await page.getByLabel(/^UF/).selectOption('SP')
  await page.getByRole('button', { name: 'Continuar para pagamento' }).click()
  await expect(page.getByTestId('resumo-frete')).toContainText('34,90')
})

test('estados vazios e busca sem resultado', async ({ page }) => {
  await page.goto('sacola')
  await expect(page.getByTestId('sacola-vazia')).toBeVisible()
  await page.goto('checkout')
  await expect(page.getByTestId('checkout-vazio')).toBeVisible()
  await page.goto('produtos?q=xyzzy')
  await expect(page.getByTestId('sem-resultados')).toBeVisible()
  await page.getByRole('button', { name: 'Limpar busca e filtros' }).click()
  await expect(page.getByTestId('contagem')).toHaveText('48 peças')
  await page.goto('produto/nao-existe')
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
})

test('ordenação e paginação do catálogo', async ({ page }) => {
  await page.goto('produtos?ordem=menor-preco')
  const prices = await page.locator('article p').allTextContents()
  const values = prices.map(brl).filter(Boolean)
  expect(values).toEqual([...values].sort((a, b) => a - b))
  await expect(page.locator('article')).toHaveCount(12)
  await page.getByRole('button', { name: 'Mostrar mais peças' }).click()
  await expect(page.locator('article')).toHaveCount(24)
})

test('todas as imagens de produto carregam', async ({ page }) => {
  await page.goto('produtos')
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Mostrar mais peças' }).click()
  await expect(page.locator('article')).toHaveCount(48)
  const urls = await page.locator('article img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src))
  for (const u of urls) {
    const r = await page.request.get(u)
    expect(r.status(), u).toBe(200)
  }
})
