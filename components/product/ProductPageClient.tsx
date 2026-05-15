"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Shield,
  Truck,
  Star,
  Share2,
  ChevronRight,
  Check,
  Fish,
  AlertCircle,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { testimonials } from "@/lib/data";
import { useStorefrontProducts } from "@/lib/storefrontProducts";
import type { Product } from "@/lib/store";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const titleCase = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getFallbackSpecifications = (product: Product) => {
  const baseSpecs: Record<string, string> = {
    "Product Type": titleCase(product.category),
    "Subcategory": product.subcategory ? titleCase(product.subcategory) : "General",
    "Availability": product.inStock ? "In stock" : "Currently unavailable",
    "Store": "Rainbow Aqua",
    "Delivery Coverage": "Tamil Nadu and serviceable Indian locations",
  };

  if (product.category === "aquarium-fish" || product.subcategory?.includes("fish")) {
    return {
      ...baseSpecs,
      "Recommended For": "Freshwater aquarium hobbyists",
      "Water Condition": "Use dechlorinated, cycled aquarium water",
      "Acclimation": "Float bag 15-20 minutes, then slow drip acclimate",
      "Feeding": "Quality fish pellets with frozen or live treats as suitable",
      "Live Arrival": "Eligible for live arrival support when delivery guidelines are followed",
    };
  }

  if (product.category === "accessories") {
    return {
      ...baseSpecs,
      "Recommended For": "Aquarium setup, maintenance, and daily care",
      "Compatibility": "Check tank size and product variant before purchase",
      "Installation": "Follow included setup instructions before first use",
      "Maintenance": "Clean regularly with aquarium-safe methods",
      "Warranty Support": "Contact Rainbow Aqua support for product assistance",
    };
  }

  return {
    ...baseSpecs,
    "Recommended For": "Pet parents and aquarium keepers",
    "Quality Check": "Inspected by Rainbow Aqua before dispatch",
    "Care Support": "Care guidance available from our support team",
  };
};

const getSpecValue = (specs: Record<string, string>, keys: string[]) => {
  const foundKey = keys.find((key) => specs[key]);
  return foundKey ? specs[foundKey] : undefined;
};

interface ProductPageClientProps {
  slug: string;
}

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const { products, isLoading } = useStorefrontProducts();
  const allProducts = useMemo(() => {
    const merged = new Map<string, Product>();
    products.forEach((product) => merged.set(product.slug || product.id, product));
    return Array.from(merged.values());
  }, [products]);
  const product = allProducts.find((p) => p.slug === slug);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { addItem, toggleCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  if (!product && isLoading) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button asChild className="mt-4">
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  const discount = product.originalPrice
    ? getDiscountPercentage(product.originalPrice, product.price)
    : 0;

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const displaySpecifications =
    product.specifications && Object.keys(product.specifications).length > 0
      ? product.specifications
      : getFallbackSpecifications(product);
  const displayRating = Number.isFinite(product.rating) && product.rating > 0 ? product.rating : 5;
  const filledStars = Math.min(5, Math.max(0, Math.round(displayRating)));
  const productType = product.subcategory ? titleCase(product.subcategory) : titleCase(product.category);
  const productWeight = getSpecValue(displaySpecifications, ["Weight", "Quantity", "Net Weight", "Pack Size"]);
  const productSize = getSpecValue(displaySpecifications, ["Size", "Flow Rate", "Power"]);
  const productReviews = testimonials
    .filter((review) =>
      review.product.toLowerCase().includes(product.name.toLowerCase()) ||
      product.name.toLowerCase().includes(review.product.toLowerCase())
    );
  const displayReviews = (productReviews.length > 0 ? productReviews : testimonials).slice(0, 3);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariants);
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} x${quantity} has been added to your cart.`,
    });
    toggleCart();
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from Wishlist" });
    } else {
      addToWishlist(product);
      toast({ title: "Added to Wishlist! ❤️" });
    }
  };

  const handleVariantChange = (name: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-muted/30 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/shop/${product.category}`} className="hover:text-primary capitalize">
              {product.category.replace("-", " ")}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
              >
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  priority
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && <Badge variant="new">NEW</Badge>}
                  {discount > 0 && <Badge variant="coral">-{discount}%</Badge>}
                  {product.subcategory === "cloned-fish" && (
                    <Badge variant="secondary">🧬 CLONED</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  <Badge className="bg-white/90 text-gray-800 hover:bg-white">Type: {productType}</Badge>
                  {productWeight && (
                    <Badge className="bg-white/90 text-gray-800 hover:bg-white">Weight: {productWeight}</Badge>
                  )}
                </div>
                <button
                  onClick={handleWishlist}
                  className="absolute top-4 right-4 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? "fill-coral text-coral" : ""
                    }`}
                  />
                </button>
              </motion.div>
              
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors bg-gray-100 ${
                        selectedImage === i ? "border-secondary" : "border-transparent"
                      }`}
                    >
                      <Image 
                        src={img} 
                        alt="" 
                        fill 
                        sizes="80px"
                        className="object-cover object-center"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-6">
                {/* Title & Rating */}
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                    {product.category.replace("-", " ")}
                    {product.subcategory && ` / ${product.subcategory.replace("-", " ")}`}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < filledStars
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({product.reviews ?? 0} reviews)
                      </span>
                    </div>
                    <button className="text-muted-foreground hover:text-primary">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">Type: {productType}</Badge>
                    {productWeight && <Badge variant="outline">Weight: {productWeight}</Badge>}
                    {productSize && <Badge variant="outline">Size: {productSize}</Badge>}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-secondary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <Badge variant="coral">Save {discount}%</Badge>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-muted-foreground">{product.description}</p>

                {/* Variants */}
                {product.variants?.map((variant) => (
                  <div key={variant.name}>
                    <p className="font-medium mb-2">{variant.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleVariantChange(variant.name, option)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            selectedVariants[variant.name] === option
                              ? "border-secondary bg-secondary/10 text-secondary"
                              : "hover:border-muted-foreground"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Quantity */}
                <div>
                  <p className="font-medium mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-muted"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-6 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-muted"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className={`text-sm ${product.inStock ? "text-accent" : "text-coral"}`}>
                      {product.inStock ? "✓ In Stock" : "Out of Stock"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    size="xl"
                    variant="ocean"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    size="xl"
                    variant="coral"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-accent" />
                    <span className="text-sm">Live Arrival Guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Truck className="w-5 h-5 text-secondary" />
                    <span className="text-sm">Overnight Shipping</span>
                  </div>
                </div>

                {/* Promo */}
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                  <p className="text-sm">
                    Use code <span className="font-bold text-accent">AQUAFIRST50</span> for 25% off!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="care">Care Guide</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                {product.tags && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="care" className="mt-6">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Fish className="w-5 h-5 text-secondary" />
                  Care Guide
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.careGuide || "Detailed care guide coming soon. Contact us for specific care requirements."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(displaySpecifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                      <dt className="font-medium">{key}</dt>
                      <dd className="text-right text-muted-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {displayReviews.map((review) => (
                    <article key={review.id} className="rounded-lg border bg-background p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.location}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">&quot;{review.text}&quot;</p>
                      <p className="mt-3 text-xs font-medium text-secondary">{review.product}</p>
                    </article>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="bg-card rounded-xl p-6 border space-y-4">
                <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">100% Live Arrival Guarantee</p>
                      <p className="text-sm text-muted-foreground">
                        If any fish arrives DOA, we'll replace it or refund you completely.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Overnight Express Shipping</p>
                      <p className="text-sm text-muted-foreground">
                        Insulated packaging with oxygen-infused water and heat/cold packs.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-coral mt-0.5" />
                    <div>
                      <p className="font-medium">Health Waiver Required</p>
                      <p className="text-sm text-muted-foreground">
                        A health waiver must be signed for live fish orders. You'll receive this at checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
