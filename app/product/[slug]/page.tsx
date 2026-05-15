import { products } from "@/lib/data";
import ProductPageClient from "@/components/product/ProductPageClient";

// Generate static params for all products
export function generateStaticParams() {
  // Use all products from data
  const allProducts = [...products];
  
  return allProducts.map((product) => ({
    slug: product.slug,
  }));
}

interface PageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: PageProps) {
  return <ProductPageClient slug={params.slug} />;
}
