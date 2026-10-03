import assert from "node:assert/strict";
import {
  products,
  collectionsOf,
  productsOf,
  subcollectionsOf,
  relatedOf,
  setPiecesOf,
  modelPath,
  collectionPath,
} from "../src/data/catalog.ts";

assert.equal(new Set(products.map((p) => p.id)).size, products.length, "Model ids must be unique");
for (const p of products) {
  assert.equal(p.photos.length, 5);
  assert.deepEqual(
    p.photos.map((photo) => photo.role),
    ["front", "detail", "side", "back", "lifestyle"],
  );
  assert.ok(
    p.photos.every((photo) => photo.src === null),
    "Preview must use explicit placeholders",
  );
  assert.ok(relatedOf(p).length <= 10);
  for (const other of [...relatedOf(p), ...setPiecesOf(p)]) {
    assert.notEqual(other.id, p.id);
    assert.equal(other.gender, p.gender);
    assert.equal(other.collection, p.collection);
  }
}
const origin = process.argv[2];
let checked = 0;
if (origin) {
  async function page(path, status = 200) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, status, `${path}: unexpected HTTP status`);
    checked++;
    return response.text();
  }
  for (const path of [
    "/",
    "/collections",
    "/women",
    "/men",
    "/atelier",
    "/about",
    "/contact",
    "/rfq",
    "/search",
    "/shortlist",
    "/faq",
    "/films",
  ]) {
    const html = await page(path);
    assert.match(html, /noindex/);
    // Check every internal rendered navigation link for a real route.
    const hrefs = new Set(
      [...html.matchAll(/href="(\/[^"#]*)"/g)].map((match) => match[1].replaceAll("&amp;", "&")),
    );
    for (const href of hrefs)
      if (
        !href.startsWith("/assets/") &&
        !href.startsWith("/src/") &&
        !href.startsWith("/@") &&
        !href.startsWith("/node_modules/")
      )
        await page(href);
  }
  for (const gender of ["women", "men"]) {
    for (const c of collectionsOf(gender)) {
      for (const sub of [undefined, ...subcollectionsOf(c.id, gender).map((s) => s.id)]) {
        const path = collectionPath(gender, c.id) + (sub ? `/${sub}` : "");
        const html = await page(path);
        const cards = [
          ...html.matchAll(/data-model="([^"]+)" data-gender="([^"]+)" data-collection="([^"]+)"/g),
        ];
        assert.equal(cards.length, productsOf(c.id, gender, sub).length, `${path}: model count`);
        assert.ok(
          cards.every((card) => card[2] === gender && card[3] === c.id),
          `${path}: context leakage`,
        );
      }
    }
  }
  for (const p of products) {
    const html = await page(modelPath(p));
    assert.ok(html.includes(`/rfq?model=${p.id}`), `${p.id}: RFQ model context missing`);
    const rfq = await page(`/rfq?model=${p.id}`);
    assert.ok(rfq.includes(p.code), `${p.id}: RFQ SKU missing`);
    const wrongGender = p.gender === "women" ? "men" : "women";
    await page(modelPath(p).replace(`/${p.gender}/`, `/${wrongGender}/`), 404);
  }
  for (const path of [
    "/other/collections/panther",
    "/women/collections/missing",
    "/women/collections/panther/missing",
    "/women/collections/panther/silver-tones/missing",
  ])
    await page(path, 404);
}
console.log(
  `PASS: ${products.length} model relationships, five photo roles, scoped related/set pieces${origin ? `; ${checked} HTTP route checks` : ""}.`,
);
