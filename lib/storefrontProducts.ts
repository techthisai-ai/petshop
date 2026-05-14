"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./store";
import type { DBProduct } from "./firebaseService";
import { FIREBASE_PRODUCT_TAG } from "./productLinks";

const fallbackFishImage = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800";
const fallbackAccessoryImage = "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800";

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
  const fallbackImage = category === "accessories" ? fallbackAccessoryImage : fallbackFishImage;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category,
    subcategory,
    price: Number(product.price) || 0,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
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
    tags: [FIREBASE_PRODUCT_TAG, product.name, product.category, product.subcategory, product.sku]
      .filter(Boolean)
      .map(String),
  };
};

// ── Module-level singleton cache ──────────────────────────────────────
// onSnapshot runs only ONCE across all pages — no duplicate Firestore listeners
let cachedProducts: Product[] = [];
let cacheLoaded = false;
let listeners: Array<(p: Product[]) => void> = [];
let unsubFirestore: (() => void) | null = null;

function subscribeToProducts() {
  if (unsubFirestore) return; // already listening
  unsubFirestore = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      cachedProducts = snapshot.docs
        .map((docSnap) =>
          mapDBProductToStorefrontProduct({
            ...(docSnap.data() as Omit<DBProduct, "id">),
            id: docSnap.id,
          } as DBProduct)
        )
        .sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.name.localeCompare(b.name);
        });
      cacheLoaded = true;
      listeners.forEach((fn) => fn(cachedProducts));
    },
    () => {
      cacheLoaded = true;
      listeners.forEach((fn) => fn([]));
    }
  );
}

export function useStorefrontProducts() {
  const [products, setProducts] = useState<Product[]>(cachedProducts);
  const [isLoading, setIsLoading] = useState(!cacheLoaded);

  useEffect(() => {
    // If already loaded from cache, skip loading state
    if (cacheLoaded) {
      setProducts(cachedProducts);
      setIsLoading(false);
      return;
    }

    const handler = (p: Product[]) => {
      setProducts(p);
      setIsLoading(false);
    };
    listeners.push(handler);
    subscribeToProducts();

    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  return { products, isLoading };
}
