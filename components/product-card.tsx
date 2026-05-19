"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, useWishlistStore, Product } from "@/lib/store";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { getProductHref } from "@/lib/productLinks";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const router = useRouter();

  const handleCardClick = () => {
    router.push(getProductHref(product));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to Wishlist! ❤️",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const discount = product.originalPrice
    ? getDiscountPercentage(product.originalPrice, product.price)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <motion.div
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
        className="group bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col cursor-pointer"
        whileHover={{
          boxShadow: "0 25px 50px -12px rgba(0, 191, 255, 0.15)",
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </motion.div>

          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isNew && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                <Badge variant="new" className="text-xs shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  NEW
                </Badge>
              </motion.div>
            )}
            {discount > 0 && (
              <Badge variant="coral" className="text-xs shadow-lg">-{discount}%</Badge>
            )}
            {product.subcategory === "cloned-fish" && (
              <Badge variant="secondary" className="text-xs shadow-lg">🧬 CLONED</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            type="button"
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isInWishlist(product.id) ? "fill-coral text-coral" : "text-gray-600"
              }`}
            />
          </motion.button>

          {/* Quick Actions */}
          <motion.div
            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={{ y: 20 }}
            whileHover={{ y: 0 }}
          >
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="flex-1 shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button type="button" size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {product.category.replace("-", " ")}
          </p>
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-secondary transition-colors flex-1">
            {product.name}
          </h3>

          {/* Weight */}
          {(product.weightValue || product.specifications?.['Weight']) && (
            <p className="text-xs text-muted-foreground mt-1">
              {product.weightValue
                ? `${product.weightValue}${product.weightUnit ?? 'g'}`
                : product.specifications!['Weight']}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            <motion.span
              className="text-lg font-bold text-secondary"
              whileHover={{ scale: 1.05 }}
            >
              {formatPrice(product.price)}
            </motion.span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <motion.p
            className={`text-xs mt-2 flex items-center gap-1 ${product.inStock ? "text-accent" : "text-coral"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className={`w-2 h-2 rounded-full ${product.inStock ? "bg-accent" : "bg-coral"} animate-pulse`} />
            {product.inStock ? "In Stock" : "Out of Stock"}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
