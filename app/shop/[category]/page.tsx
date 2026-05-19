import { categories } from "@/lib/data";
import { dogsAndCatsCategory } from "@/lib/dogsAndCatsData";
import CategoryPageClient from "@/components/shop/CategoryPageClient";

const allCategories = [dogsAndCatsCategory, ...categories];

export function generateStaticParams() {
  return allCategories.map((category) => ({
    category: category.slug,
  }));
}

interface PageProps {
  params: { category: string };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <CategoryPageClient categorySlug={resolvedParams.category} />;
}
