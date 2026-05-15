"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Filter } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { categories } from "@/lib/data";
import { dogsAndCatsCategory } from "@/lib/dogsAndCatsData";
import { useStorefrontProducts } from "@/lib/storefrontProducts";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const allCategories = [dogsAndCatsCategory, ...categories];

interface Props {
  categorySlug: string;
  subcategorySlug: string;
}

export default function SubcategoryPageClient({ categorySlug, subcategorySlug }: Props) {
  const category = allCategories.find((c) => c.slug === categorySlug);
  const subcategory = category?.subcategories?.find((s) => s.slug === subcategorySlug);

  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const { products } = useStorefrontProducts();

  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (p) => p.category === categorySlug && p.subcategory === subcategorySlug
    );
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (inStockOnly) result = result.filter((p) => p.inStock);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      default:
        result = result.filter((p) => p.isFeatured).concat(result.filter((p) => !p.isFeatured));
    }
    return result;
  }, [products, categorySlug, subcategorySlug, priceRange, inStockOnly, sortBy]);

  const filterContent = (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={150000} step={500} />
              <div className="flex justify-between text-sm">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex items-center space-x-2">
        <Checkbox id="inStock" checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(v as boolean)} />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">In Stock Only</Label>
      </div>
      <Button variant="outline" onClick={() => { setPriceRange([0, 150000]); setInStockOnly(false); }} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  const gridClass = { 2: "grid-cols-2", 4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" };

  if (!category || !subcategory) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Button asChild className="mt-4"><Link href="/shop">Back to Shop</Link></Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <section
        className="relative py-12 md:py-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${category.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <Badge variant="secondary" className="mb-4">{category.name}</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{subcategory.name}</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Explore our {subcategory.name} collection from {category.name}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </h2>
                {filterContent}
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="w-4 h-4 mr-2" /> Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                      <div className="mt-4 overflow-y-auto h-full pb-20">{filterContent}</div>
                    </SheetContent>
                  </Sheet>
                  <p className="text-sm text-muted-foreground">{filteredProducts.length} products</p>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`grid ${gridClass[gridCols]} gap-4 md:gap-6`}>
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found in this category.</p>
                  <Button asChild className="mt-4">
                    <Link href={`/shop/${categorySlug}`}>View All {category.name}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
