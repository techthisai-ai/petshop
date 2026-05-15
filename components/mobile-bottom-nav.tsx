'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Search, 
  ShoppingCart, 
  Heart, 
  User,
  Grid3X3,
  Fish,
  Sparkles,
  X
} from 'lucide-react'
import { useCartStore, useWishlistStore, useUIStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { CartDrawer } from './cart-drawer'

const navItems = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home,
    activeColor: 'from-cyan-500 to-blue-500',
    exactMatch: true
  },
  { 
    name: 'Shop', 
    href: '/shop', 
    icon: Grid3X3,
    activeColor: 'from-emerald-500 to-teal-500',
    additionalPaths: ['/product']
  },
  { 
    name: 'Cart', 
    href: '#cart', 
    icon: ShoppingCart,
    activeColor: 'from-orange-500 to-amber-500',
    isCart: true
  },
  { 
    name: 'Wishlist', 
    href: '/account/wishlist', 
    icon: Heart,
    activeColor: 'from-pink-500 to-rose-500'
  },
  { 
    name: 'Account', 
    href: '/account', 
    icon: User,
    activeColor: 'from-violet-500 to-purple-500',
    additionalPaths: ['/auth']
  },
]

export function MobileBottomNav() {
  const pathname = usePathname() ?? '/'
  const { getItemCount } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollYRef = useRef(0)
  const isVisibleRef = useRef(true)

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return

      ticking = true
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const nextVisible = !(currentScrollY > lastScrollYRef.current && currentScrollY > 100)

        lastScrollYRef.current = currentScrollY

        if (isVisibleRef.current !== nextVisible) {
          isVisibleRef.current = nextVisible
          setIsVisible(nextVisible)
        }

        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (item: typeof navItems[0]) => {
    if (item.exactMatch) return pathname === item.href
    if (pathname.startsWith(item.href)) return true
    if (item.additionalPaths) {
      return item.additionalPaths.some(path => pathname.startsWith(path))
    }
    return false
  }

  return (
    <>
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]" />
            
            {/* Curved Top Edge Decoration */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-t-full border-t border-l border-r border-white/20" />
            
            {/* Navigation Items */}
            <div className="relative flex items-center justify-around px-2 py-2 safe-area-bottom">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item)
                const itemCount = item.isCart ? getItemCount() : item.name === 'Wishlist' ? wishlistItems.length : 0

                // Cart item - opens drawer instead of navigating
                if (item.isCart) {
                  return (
                    <CartDrawer key={item.name}>
                      <motion.button
                        className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[64px] touch-manipulation"
                        whileTap={{ scale: 0.9 }}
                      >
                        {/* Active Background Glow */}
                        {active && (
                          <motion.div
                            layoutId="activeNavBg"
                            className={cn(
                              "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-20",
                              item.activeColor
                            )}
                            initial={false}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        
                        {/* Icon Container */}
                        <motion.div
                          className={cn(
                            "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                            active ? `bg-gradient-to-r ${item.activeColor} shadow-lg` : "bg-transparent"
                          )}
                          animate={active ? { y: -8 } : { y: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                          <Icon 
                            className={cn(
                              "w-5 h-5 transition-colors duration-300",
                              active ? "text-white" : "text-slate-500 dark:text-slate-400"
                            )} 
                          />
                          
                          {/* Badge */}
                          {itemCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                            >
                              {itemCount > 99 ? '99+' : itemCount}
                            </motion.span>
                          )}
                        </motion.div>
                        
                        {/* Label */}
                        <motion.span
                          className={cn(
                            "text-[10px] font-medium mt-1 transition-colors duration-300",
                            active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                          )}
                          animate={active ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
                        >
                          {item.name}
                        </motion.span>
                        
                        {/* Active Indicator Dot */}
                        {active && (
                          <motion.div
                            layoutId="activeNavDot"
                            className={cn("absolute -bottom-1 w-1 h-1 rounded-full bg-gradient-to-r", item.activeColor)}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    </CartDrawer>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <motion.div
                      className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[64px] touch-manipulation"
                      whileTap={{ scale: 0.9 }}
                    >
                      {/* Active Background Glow */}
                      {active && (
                        <motion.div
                          layoutId="activeNavBg"
                          className={cn(
                            "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-20",
                            item.activeColor
                          )}
                          initial={false}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      {/* Icon Container */}
                      <motion.div
                        className={cn(
                          "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                          active ? `bg-gradient-to-r ${item.activeColor} shadow-lg` : "bg-transparent"
                        )}
                        animate={active ? { y: -8 } : { y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <Icon 
                          className={cn(
                            "w-5 h-5 transition-colors duration-300",
                            active ? "text-white" : "text-slate-500 dark:text-slate-400"
                          )} 
                        />
                        
                        {/* Badge for Wishlist */}
                        {itemCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                          >
                            {itemCount > 99 ? '99+' : itemCount}
                          </motion.span>
                        )}
                      </motion.div>
                      
                      {/* Label */}
                      <motion.span
                        className={cn(
                          "text-[10px] font-medium mt-1 transition-colors duration-300",
                          active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                        )}
                        animate={active ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
                      >
                        {item.name}
                      </motion.span>
                      
                      {/* Active Indicator Dot */}
                      {active && (
                        <motion.div
                          layoutId="activeNavDot"
                          className={cn("absolute -bottom-1 w-1 h-1 rounded-full bg-gradient-to-r", item.activeColor)}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-20 lg:hidden" />
    </>
  )
}
