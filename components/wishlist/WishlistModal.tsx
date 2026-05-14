'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/store/useWishlistStore'
import type { WishlistItem } from '@/types'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/utils'

export default function WishlistModal() {
  const { items: rawItems, isOpen, closeWishlist, removeItem } = useWishlistStore()
  const items = rawItems as WishlistItem[]
  const { addItem: addToCart } = useCartStore()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWishlist()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeWishlist])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleMoveToCart = (productId: string) => {
    const item = items.find((i: WishlistItem) => i.product.id === productId)
    if (item) {
      addToCart(item.product)
      removeItem(productId)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 sm:inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:max-w-2xl md:w-full md:max-h-[80vh] bg-white sm:rounded-2xl shadow-2xl z-50 
                       flex flex-col overflow-hidden"
            style={{ 
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)' 
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <h2 className="font-heading font-bold text-xl">My Wishlist</h2>
                <span className="bg-red-100 text-red-500 text-sm font-semibold px-2 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={closeWishlist}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close wishlist"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="text-6xl mb-4"
                  >
                    💝
                  </motion.div>
                  <h3 className="font-heading font-bold text-xl mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500 mb-6">Save items you love for later!</p>
                  <Link href="/shop" onClick={closeWishlist}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary"
                    >
                      <span>Explore Products</span>
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-gray-50 rounded-xl p-3 hover:shadow-lg transition-shadow"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md 
                                   text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 
                                   transition-all z-10"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={closeWishlist}
                        className="block"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {item.product.isOnSale && (
                            <span className="absolute top-2 left-2 badge badge-sale">Sale</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary-500 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-primary-500">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.compareAtPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(item.product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleMoveToCart(item.product.id)}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2 
                                   bg-primary-500 text-white rounded-lg font-medium text-sm
                                   hover:bg-primary-600 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Move to Cart
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <Link href="/wishlist" onClick={closeWishlist}>
                  <button className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" />
                    View Full Wishlist
                  </button>
                </Link>
                <Link href="/shop" onClick={closeWishlist}>
                  <button className="w-full btn-secondary">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

