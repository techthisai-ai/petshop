"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./store";
import type { DBProduct } from "./firebaseService";
import { FIREBASE_PRODUCT_TAG } from "./productLinks";
import { dogsAndCatsProducts } from "./dogsAndCatsData";

// ── Static product base — always available synchronously ──────────────
export const staticProducts: Product[] = [
  ...dogsAndCatsProducts,
];

// ── Firestore normalisation helpers ───────────────────────────────────
const fallbackFishImage =
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800";
const fallbackAccessoryImage =
  "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800";

const categoryMap: Record<string, string> = {
  fish: "aquarium-fish",
  "aquarium fish": "aquarium-fish",
  "aquarium-fish": "aquarium-fish",
  accessories: "accessories",
  accessory: "accessories",
  birds: "birds",
};

const subcategoryMap: Record<string, string> = {
  betta: "betta-fish",
  "betta fish": "betta-fish",
  goldfish: "goldfish",
  guppy: "guppies",
  guppies: "guppies",
  discus: "discus",
  angelfish: "tropical-fish",
  tetra: "tropical-fish",
  molly: "tropical-fish",
  flowerhorn: "flowerhorn",
  aquarium: "aquarium-tanks",
  filter: "filters",
  filters: "filters",
  heater: "heaters",
  heaters: "heaters",
  light: "lighting",
  lighting: "lighting",
  food: "food-nutrition",
  decor: "decorations",
  decorations: "decorations",
};

const normalizeKey = (value?: string) =>
  (value ?? "").toLowerCase().trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");

const normalizeCategory = (value?: string) => {
  const key = normalizeKey(value);
  return categoryMap[key] ?? (value || "accessories");
};

const normalizeSubcategory = (value?: string) => {
  const key = normalizeKey(value);
  return subcategoryMap[key] ?? value?.toLowerCase().trim().replace(/\s+/g, "-");
};

export const mapDBProductToStorefrontProduct = (product: DBProduct): Product => {
  const category = normalizeCategory(product.category);
  const subcategory = normalizeSubcategory(product.subcategory);
  const images = product.images?.filter(Boolean);
  const fallbackImage =
    category === "accessories" ? fallbackAccessoryImage : fallbackFishImage;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category,
    subcategory,
    price: Number(product.price) || 0,
    originalPrice: product.originalPrice
      ? Number(product.originalPrice)
      : undefined,
    images: images?.length ? images : [fallbackImage],
    description: product.description || "Premium product from Rainbow Aqua.",
    specifications: {
      ...(product.sku ? { SKU: product.sku } : {}),
      ...(product.stock !== undefined ? { Stock: String(product.stock) } : {}),
      ...(product.weightValue
        ? { Weight: `${product.weightValue}${product.weightUnit ?? "g"}` }
        : {}),
      Category: category,
      ...(subcategory ? { Subcategory: subcategory } : {}),
    },
    variants: product.variants?.length
      ? [{ name: "Options", options: product.variants }]
      : undefined,
    inStock: product.inStock ?? Number(product.stock) > 0,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    rating: 5,
    reviews: 0,
    weightValue: product.weightValue,
    weightUnit: product.weightUnit,
    tags: [
      FIREBASE_PRODUCT_TAG,
      product.name,
      product.category,
      product.subcategory,
      product.sku,
    ]
      .filter(Boolean)
      .map(String),
  };
};

// ── Merge helper: Firestore products override static ones by id ───────
function mergeWithStatic(firestoreProducts: Product[]): Product[] {
  const firestoreIds = new Set(firestoreProducts.map((p) => p.id));
  return [
    ...firestoreProducts,
    ...staticProducts.filter((p) => !firestoreIds.has(p.id)),
  ].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return a.name.localeCompare(b.name);
  });
}

// ── Module-level Firestore subscription (shared across hook instances) ─
let firestoreProducts: Product[] = [];
let firestoreLoaded = false;
let listeners: Array<(p: Product[]) => void> = [];
let unsubFirestore: (() => void) | null = null;

function subscribeToFirestore() {
  if (unsubFirestore) return;
  unsubFirestore = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      firestoreProducts = snapshot.docs.map((docSnap) =>
        mapDBProductToStorefrontProduct({
          ...(docSnap.data() as Omit<DBProduct, "id">),
          id: docSnap.id,
        } as DBProduct)
      );
      firestoreLoaded = true;
      const merged = mergeWithStatic(firestoreProducts);
      listeners.forEach((fn) => fn(merged));
    },
    () => {
      // Firestore unavailable — static products are already shown, nothing to do
      firestoreLoaded = true;
    }
  );
}

// ── Hook ──────────────────────────────────────────────────────────────
export function useStorefrontProducts() {
  // Always start with static products — never an empty array
  const [products, setProducts] = useState<Product[]>(() =>
    firestoreLoaded ? mergeWithStatic(firestoreProducts) : [...staticProducts]
  );

  useEffect(() => {
    // If Firestore already loaded, apply the merged result immediately
    if (firestoreLoaded) {
      setProducts(mergeWithStatic(firestoreProducts));
    }

    // Register listener for future Firestore updates
    const handler = (merged: Product[]) => setProducts(merged);
    listeners.push(handler);

    // Start Firestore subscription if not already running
    subscribeToFirestore();

    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  return { products, isLoading: false };
}
