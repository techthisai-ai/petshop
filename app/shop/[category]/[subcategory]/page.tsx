import { categories } from "@/lib/data";
import SubcategoryPageClient from "@/components/shop/SubcategoryPageClient";

const allCategories = categories;

export function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = [];
  allCategories.forEach((category) => {
    category.subcategories?.forEach((sub) => {
      params.push({ category: category.slug, subcategory: sub.slug });
    });
  });
  return params;
}

interface PageProps {
  params: { category: string; subcategory: string };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <SubcategoryPageClient categorySlug={resolvedParams.category} subcategorySlug={resolvedParams.subcategory} />;
}
