import { categories } from "@/lib/data";
import { dogsAndCatsCategory } from "@/lib/dogsAndCatsData";
import SubcategoryPageClient from "@/components/shop/SubcategoryPageClient";

const allCategories = [dogsAndCatsCategory, ...categories];

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

export default function SubcategoryPage({ params }: PageProps) {
  return <SubcategoryPageClient categorySlug={params.category} subcategorySlug={params.subcategory} />;
}
