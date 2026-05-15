import { products } from "@/lib/data";
import { dogsAndCatsProducts } from "@/lib/dogsAndCatsData";
import ProductPageClient from "@/components/product/ProductPageClient";

export function generateStaticParams() {
  return [...products, ...dogsAndCatsProducts]
    .filter((p) => Boolean(p.slug))
    .map((p) => ({ slug: p.slug }));
}

interface PageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: PageProps) {
  return <ProductPageClient slug={params.slug} />;
}
