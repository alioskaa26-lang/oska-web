import { chromium } from 'playwright';

const base = process.env.QA_URL || 'http://127.0.0.1:4173/';
const targets = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 } },
  { name: 'tablet', viewport: { width: 1024, height: 1366 } },
  { name: 'iphone', viewport: { width: 390, height: 844 } },
  { name: 'android', viewport: { width: 412, height: 915 } },
];

const failures = [];
const browser = await chromium.launch({ headless: true });

for (const target of targets) {
  const context = await browser.newContext({ viewport: target.viewport });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('console', msg => msg.type() === 'error' && runtimeErrors.push(msg.text()));
  page.on('pageerror', err => runtimeErrors.push(err.message));

  await page.goto(base + '#/home', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('oska-lang', 'en');
    location.hash = '#/home';
  });
  await page.reload({ waitUntil: 'networkidle' });

  if (target.viewport.width > 1100) {
    await page.locator('[data-nav-route="women"]').click();
  } else {
    await page.locator('.mobile-menu-button').click();
    const drawer = page.locator('.mobile-drawer');
    const women = drawer.getByRole('button', { name: /^Women$/ }).first();
    if (!(await women.count())) failures.push(`${target.name}: Women button missing in mobile drawer`);
    else await women.click();
  }
  await page.waitForFunction(() => location.hash === '#/women');

  const braceletCard = page.locator('.category-card').filter({ hasText: 'Bracelets' }).first();
  if (!(await braceletCard.count())) failures.push(`${target.name}: Women → Bracelets card missing`);
  else await braceletCard.click();
  await page.waitForFunction(() => location.hash === '#/women/bracelets');

  const firstProduct = page.locator('.product-media').first();
  if (!(await firstProduct.count())) failures.push(`${target.name}: product card missing`);
  else await firstProduct.click();
  await page.waitForFunction(() => location.hash.startsWith('#/product/'));

  const quote = page.getByRole('button', { name: /Request a quotation/i }).first();
  if (!(await quote.count())) failures.push(`${target.name}: PDP RFQ CTA missing`);
  else await quote.click();
  await page.waitForFunction(() => location.hash === '#/contact');

  const rfqForm = page.locator('form').first();
  if (!(await rfqForm.count())) failures.push(`${target.name}: RFQ form missing`);

  const lang = page.locator('.lang-button');
  if (!(await lang.count())) failures.push(`${target.name}: language control missing`);
  else await lang.click();
  await page.waitForFunction(() => document.documentElement.lang === 'tr');

  const guide = page.locator('.guide-trigger');
  if (!(await guide.count())) failures.push(`${target.name}: OSKA AI trigger missing`);
  else await guide.click();
  const guidePanel = page.locator('.guide-panel');
  if (!(await guidePanel.count())) failures.push(`${target.name}: OSKA AI panel did not open`);

  const braceletIntent = guidePanel.getByRole('button', { name: /Bileklikleri göster/i }).first();
  if (await braceletIntent.count()) {
    await braceletIntent.click();
    await page.waitForFunction(() => location.hash === '#/bracelets');
  } else {
    failures.push(`${target.name}: AI bracelet intent missing`);
  }

  await page.goBack();
  await page.waitForTimeout(150);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  if (overflow) failures.push(`${target.name}: horizontal overflow after critical flow`);
  if (runtimeErrors.length) failures.push(`${target.name}: runtime errors: ${runtimeErrors.join(' | ')}`);

  await context.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('OSKA FINAL SPRINT critical flow passed on desktop/tablet/iPhone/Android viewports.');
