import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4173/';
const viewports = [
  { name: '1280', width: 1280, height: 900 },
  { name: '820', width: 820, height: 1180 },
  { name: '390', width: 390, height: 844 },
];
const routes = [
  'home','women','men','collections','bracelets','product/panther-bracelet-silver',
  'manufacturing','private-label','contact','search-page','favorites'
];

await fs.mkdir('qa', { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') runtimeErrors.push(msg.text());
  });
  page.on('pageerror', err => runtimeErrors.push(err.message));

  await page.goto(base + '#/home', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('oska-lang', 'en');
    location.hash = '#/home';
  });
  await page.reload({ waitUntil: 'networkidle' });

  for (const lang of ['en', 'tr']) {
    const htmlLang = await page.locator('html').getAttribute('lang');
    if (htmlLang !== lang) {
      failures.push(`${viewport.name}: expected html lang ${lang}, got ${htmlLang}`);
    }

    for (const route of routes) {
      await page.goto(base + '#/' + route, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      );
      if (overflow) failures.push(`${viewport.name}/${lang}/${route}: horizontal overflow`);
      if (!(await page.locator('#main').count())) {
        failures.push(`${viewport.name}/${lang}/${route}: missing main`);
      }
    }

    await page.goto(base + '#/home', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: `qa/${viewport.name}-${lang}-home.png`,
      fullPage: true,
    });

    if (lang === 'en') {
      await page.locator('.lang-button').click();
      await page.waitForTimeout(100);
    }
  }

  await page.goto(base + '#/home', { waitUntil: 'networkidle' });
  await page.locator('.search-trigger').click();
  if (!(await page.locator('.search-panel input').evaluate(el => el === document.activeElement))) {
    failures.push(`${viewport.name}: search did not receive initial focus`);
  }
  if (!(await page.evaluate(() => document.body.style.overflow === 'hidden'))) {
    failures.push(`${viewport.name}: search did not lock body scroll`);
  }
  await page.keyboard.press('Escape');
  if (!(await page.locator('.search-trigger').evaluate(el => el === document.activeElement))) {
    failures.push(`${viewport.name}: search focus did not return to trigger`);
  }

  if (viewport.width <= 1100) {
    await page.locator('.mobile-menu-button').click();
    if (!(await page.evaluate(() => document.body.style.overflow === 'hidden'))) {
      failures.push(`${viewport.name}: drawer did not lock body scroll`);
    }
    if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('.mobile-drawer'))))) {
      failures.push(`${viewport.name}: drawer did not receive initial focus`);
    }
    await page.keyboard.press('Escape');
    if (!(await page.locator('.mobile-menu-button').evaluate(el => el === document.activeElement))) {
      failures.push(`${viewport.name}: drawer focus did not return to trigger`);
    }
  }

  if (viewport.width === 390) {
    const brandBox = await page.locator('.brand').boundingBox();
    const toolsBox = await page.locator('.header-tools').boundingBox();
    if (brandBox && toolsBox && brandBox.x + brandBox.width > toolsBox.x) {
      failures.push('390: brand overlaps header tools');
    }
  }

  if (runtimeErrors.length) {
    failures.push(`${viewport.name}: runtime errors: ${runtimeErrors.join(' | ')}`);
  }
  await context.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('OSKA Stage 5 QA passed: 1280 / 820 / 390, EN/TR, routes, overflow, overlays and runtime.');
