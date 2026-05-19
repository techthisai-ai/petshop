"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, Grid3X3, SlidersHorizontal, X } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductCarousel from "@/components/ui/ProductCarousel";
import { categories, searchProducts } from "@/lib/data";
import { useStorefrontProducts } from "@/lib/storefrontProducts";
import { formatPrice } from "@/lib/utils";

const allCategories = categories;

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [gridCols, setGridCols] = useState<2 | 3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [urlFilter, setUrlFilter] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { products } = useStorefrontProducts();

  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter");

    setSelectedCategories(category ? [category] : []);
    setSearchQuery(search ?? "");
    setUrlFilter(filter ?? "");
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (normalizedSearch) {
      result = searchProducts(normalizedSearch, result);
    }

    // Filter by price
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by stock
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
        break;
      default:
        if (urlFilter === "deals") {
          result = result.filter((p) => p.originalPrice);
        } else if (urlFilter === "new") {
          result = result.filter((p) => p.isNew);
        } else if (urlFilter === "sale") {
          result = result.filter((p) => p.originalPrice);
        }
        result = result.filter((p) => p.isFeatured).concat(result.filter((p) => !p.isFeatured));
    }

    return result;
  }, [products, selectedCategories, searchQuery, priceRange, inStockOnly, sortBy, urlFilter]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setUrlFilter("");
    setPriceRange([0, 150000]);
    setInStockOnly(false);
  };

  const filterContent = (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {allCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={category.id} className="text-sm cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={150000}
                step={1000}
              />
              <div className="flex items-center justify-between text-sm">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In Stock Only
        </Label>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">SHOP ALL</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              All Products
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Discover our complete collection of premium fish, pets, and accessories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Products - Smooth Drag Carousel */}
      <ProductCarousel
        products={products.filter(p => p.isFeatured).slice(0, 8)}
        variant="smooth"
        title="✨ Featured Collection"
        subtitle="Hand-picked premium products for discerning aquarium lovers"
        accentColor="primary"
      />

      {/* Hot Deals - Coverflow Style */}
      <ProductCarousel
        products={products.filter(p => p.originalPrice).slice(0, 8)}
        variant="coverflow"
        title="🔥 Hot Deals"
        subtitle="Limited time offers - Don't miss out!"
        showViewAll
        viewAllLink="/shop?filter=deals"
        accentColor="coral"
      />

      {/* New Arrivals - Smooth Scroll Carousel */}
      <ProductCarousel
        products={products.filter(p => p.isNew).slice(0, 10)}
        variant="smooth"
        title="New Arrivals"
        subtitle="Fresh drops just for you"
        showViewAll
        viewAllLink="/shop?filter=new"
        accentColor="accent"
      />

      {/* Shop Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                {filterContent}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {selectedCategories.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedCategories.length}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 overflow-y-auto h-full pb-20">
                        {filterContent}
                      </div>
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} products
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search products"
                    className="w-full sm:w-64"
                  />

                  {/* Grid Toggle */}
                  <div className="hidden md:flex items-center border rounded-lg">
                    <button
                      onClick={() => setGridCols(2)}
                      className={`p-2 ${gridCols === 2 ? "bg-muted" : ""}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGridCols(4)}
                      className={`p-2 ${gridCols === 4 ? "bg-muted" : ""}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || searchQuery) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setSearchQuery("")}
                    >
                      Search: {searchQuery}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  )}
                  {selectedCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => toggleCategory(cat)}
                    >
                      {allCategories.find((c) => c.id === cat)?.name}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Product Grid */}
              <div className={`grid ${gridColsClass[gridCols]} gap-4 md:gap-6`}>
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found matching your criteria.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
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

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}
