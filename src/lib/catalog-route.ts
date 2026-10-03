import { notFound } from "@tanstack/react-router";
import { getCollection, getProduct, isGender, productsOf, subcollectionsOf } from "@/data/catalog";
export function validateCatalogRoute(params: Record<string, string>) {
  const { gender, collection, subcollection, model } = params;
  if (!gender || !isGender(gender)) throw notFound();
  if (collection && (!getCollection(collection) || !productsOf(collection, gender).length))
    throw notFound();
  if (
    subcollection &&
    (!collection || !subcollectionsOf(collection, gender).some((s) => s.id === subcollection))
  )
    throw notFound();
  if (model) {
    const p = getProduct(model);
    if (
      !p ||
      p.gender !== gender ||
      p.collection !== collection ||
      p.subcollection !== subcollection
    )
      throw notFound();
  }
}
