import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = ['./', 'produtos', 'produto/conjunto-calca-colete-risca-de-giz', 'sacola', 'checkout', 'sobre-a-demonstracao']

for (const path of pages) {
  test(`sem violações graves de acessibilidade: /${path.replace('./', '')}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForTimeout(1200)
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
  })
}

test('rotas internas abrem diretamente e após recarregar', async ({ page }) => {
  for (const path of ['produtos?categoria=vestidos', 'produto/trico-poa', 'sacola', 'checkout', 'sobre-a-demonstracao']) {
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    await page.reload()
    await expect(page.locator('h1')).toBeVisible()
  }
})
