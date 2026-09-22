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
  'manufacturing','private-label','contact','search-page','favorites','admin'
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

    const categoryImages = page.locator('.manual-category-image');
    const categoryImageCount = await categoryImages.count();
    if (categoryImageCount !== 4) {
      failures.push(`${viewport.name}/${lang}: expected 4 category images, got ${categoryImageCount}`);
    } else {
      for (let i = 0; i < categoryImageCount; i += 1) {
        const loaded = await categoryImages.nth(i).evaluate(
          el => el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0
        );
        if (!loaded) failures.push(`${viewport.name}/${lang}: category image ${i + 1} failed to load`);
      }
    }

    const expectedNav = lang === 'tr'
      ? ['Kadın', 'Erkek', 'Koleksiyonlar', 'Üretim', 'Özel Etiket', 'OSKA Dünyası']
      : ['Women', 'Men', 'Collections', 'Manufacturing', 'Private Label', 'OSKA World'];
    const expectedHero = lang === 'tr'
      ? 'Kalıcı iş ortaklıkları'
      : 'Jewelry made for';

    await page.goto(base + '#/home', { waitUntil: 'networkidle' });
    const navText = await page.locator('.desktop-nav').innerText().catch(() => '');
    for (const label of expectedNav) {
      if (!navText.includes(label)) {
        failures.push(`${viewport.name}/${lang}: missing localized nav label "${label}"`);
      }
    }
    const heroText = await page.locator('.hero').innerText().catch(() => '');
    if (!heroText.includes(expectedHero)) {
      failures.push(`${viewport.name}/${lang}: hero copy did not switch language`);
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
      if (route === 'admin') {
        if (!(await page.locator('.visual-editor-workspace').count())) {
          failures.push(`${viewport.name}/${lang}/admin: visual editor workspace missing`);
        }
        if (!(await page.locator('.visual-editor-canvas').count())) {
          failures.push(`${viewport.name}/${lang}/admin: live preview missing`);
        }
        if (!(await page.locator('.visual-editor-inspector').count())) {
          failures.push(`${viewport.name}/${lang}/admin: inspector missing`);
        }
      }
    }

    await page.goto(base + '#/home', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: `qa/${viewport.name}-${lang}-home.png`,
      fullPage: true,
    });

    if (viewport.width === 1280) {
      const navRoutes = ['women', 'men', 'collections', 'manufacturing', 'private-label', 'world'];
      for (const target of navRoutes) {
        await page.goto(base + '#/home', { waitUntil: 'networkidle' });
        const nav = page.locator(`[data-nav-route="${target}"]`);
        if (!(await nav.count())) {
          failures.push(`1280/${lang}: missing top nav route ${target}`);
          continue;
        }
        await nav.click();
        await page.waitForFunction(
          expected => location.hash === `#/${expected}`,
          target
        );
        if (await page.evaluate(expected => location.hash !== `#/${expected}`, target)) {
          failures.push(`1280/${lang}: top nav failed for ${target}`);
        }
      }

      await page.goto(base + '#/home', { waitUntil: 'networkidle' });
      const manufacturingNav = page.locator('[data-nav-route="manufacturing"]');
      await manufacturingNav.hover();
      const manufacturingMenu = page.locator('.mega-menu');
      if (!(await manufacturingMenu.getByText(lang === 'en' ? 'Manufacturing overview' : 'Üretim genel bakış').count())) {
        failures.push(`1280/${lang}: manufacturing mega-menu content incorrect`);
      }

      await page.goto(base + '#/home', { waitUntil: 'networkidle' });
      const collectionsNav = page.locator('[data-nav-route="collections"]');
      await collectionsNav.hover();
      const collectionsMenu = page.locator('.mega-menu');
      if (!(await collectionsMenu.getByText('Panther').count())) {
        failures.push(`1280/${lang}: collections mega-menu content incorrect`);
      }
    }

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
  await page.locator('.search-overlay').waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.classList.contains('search-trigger'));
  if (!(await page.locator('.search-trigger').evaluate(el => el === document.activeElement))) {
    failures.push(`${viewport.name}: search focus did not return to trigger`);
  }

  if (viewport.width <= 1100) {
    await page.locator('.mobile-menu-button').click();
    if (!(await page.evaluate(() => document.body.style.overflow === 'hidden'))) {
      failures.push(`${viewport.name}: drawer did not lock body scroll`);
    }
    await page.waitForFunction(() => Boolean(document.activeElement?.closest('.mobile-drawer')));
    if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('.mobile-drawer'))))) {
      failures.push(`${viewport.name}: drawer did not receive initial focus`);
    }
    await page.keyboard.press('Escape');
    await page.locator('.drawer-backdrop').waitFor({ state: 'detached' });
    await page.waitForFunction(() => document.activeElement?.classList.contains('mobile-menu-button'));
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
