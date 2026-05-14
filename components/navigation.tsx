"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  Fish,
  ChevronDown,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCartStore, useWishlistStore, useUIStore } from "@/lib/store";
import { useAuthStore } from "@/store/useAuthStore";
import { categories } from "@/lib/data";
import { birdsAndFishCategory } from "@/lib/birdsAndFishData";
import { dogsAndCatsCategory } from "@/lib/dogsAndCatsData";
import { cn } from "@/lib/utils";
import { CartDrawer } from "./cart-drawer";
import { isAdminEmail } from "@/lib/authConfig";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop", hasDropdown: true },
  { name: "🐦 Birds & Fish", href: "/birds-fish", highlight: true, isNew: true },
  { name: "🐾 Dogs & Cats", href: "/dogs-cats", highlight: true, isDogsCats: true },
  { name: "Cloned Fish", href: "/shop/aquarium-fish/cloned-fish" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const priorityRoutes = [
  "/",
  "/shop",
  "/birds-fish",
  "/shop/aquarium-fish/cloned-fish",
  "/blog",
  "/contact",
  "/account",
  "/account/wishlist",
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isMobileMenuOpen, toggleMobileMenu, searchQuery, setSearchQuery } = useUIStore();
  const { isAuthenticated, currentUser } = useAuthStore();
  const hasAdminAccess = currentUser?.role === 'owner' && isAdminEmail(currentUser.email);
  const prefetchedRoutes = useRef(new Set<string>());

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 50;
        setIsScrolled((current) => (current === nextScrolled ? current : nextScrolled));
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const prefetchRoute = (href: string) => {
    if (prefetchedRoutes.current.has(href)) return;

    prefetchedRoutes.current.add(href);
    router.prefetch(href);
  };

  const runSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      priorityRoutes.forEach((href) => {
        if (prefetchedRoutes.current.has(href)) return;

        prefetchedRoutes.current.add(href);
        router.prefetch(href);
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <>
      {/* Promo Bar */}
      <motion.div 
        className="bg-gradient-to-r from-primary via-primary to-secondary text-white text-center py-2.5 text-sm relative overflow-hidden"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        {/* Animated sparkles */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${15 + i * 20}%`, top: "50%" }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </motion.div>
          ))}
        </motion.div>
        
        <div className="container mx-auto px-4 flex items-center justify-center gap-2 flex-wrap relative">
          <motion.span 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎉
          </motion.span>
          <span>Use code <strong className="text-yellow-300 bg-white/10 px-2 py-0.5 rounded">AQUAFIRST50</strong> for 25% off your first order!</span>
          <span className="hidden sm:inline mx-2">|</span>
          <span className="hidden sm:flex items-center gap-1">
            <Phone className="w-3 h-3" />
            +91 98765 43210
          </span>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg"
            : "bg-background"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring" }}
              >
                <motion.div 
                  className="absolute inset-0 bg-secondary/30 rounded-full blur-md"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-full">
                  <Fish className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl md:text-2xl font-bold text-primary dark:text-white">
                  Rainbow Aqua and Pets
                </h1>
                <p className="text-[10px] text-muted-foreground -mt-1">Premium Fish & Pets</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    onMouseEnter={() => prefetchRoute(link.href)}
                    onFocus={() => prefetchRoute(link.href)}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted",
                      link.highlight && !(link as any).isNew && !(link as any).isDogsCats && "text-secondary font-semibold",
                      (link as any).isNew && "bg-gradient-to-r from-cyan-50 to-emerald-50 text-cyan-700",
                      (link as any).isDogsCats && "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-semibold"
                    )}
                  >
                    {link.highlight && !(link as any).isNew && <Sparkles className="w-3 h-3" />}
                    {link.name}
                    {(link as any).isNew && (
                      <Badge className="bg-emerald-500 text-white text-[10px] ml-1">NEW</Badge>
                    )}
                    {link.hasDropdown && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          activeDropdown === link.name && "rotate-180"
                        )}
                      />
                    )}
                  </Link>

                  {/* Mega Dropdown */}
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 top-full pt-2 w-[500px]"
                        >
                          <div className="bg-background rounded-2xl shadow-2xl border p-6 backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-6">
                              {/* Dogs & Cats Category - Featured */}
                              <div className="col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl mb-2">
                                <Link
                                  href="/dogs-cats"
                                  onMouseEnter={() => prefetchRoute("/dogs-cats")}
                                  className="font-semibold text-sm mb-2 flex items-center gap-2 text-amber-700 hover:text-amber-600 transition-colors"
                                >
                                  🐾 Dogs & Cats 🐱
                                </Link>
                                <p className="text-xs text-gray-600 mb-2">Premium food, toys & accessories for dogs and cats</p>
                                <div className="flex gap-2 flex-wrap">
                                  {dogsAndCatsCategory.subcategories.map((sub) => (
                                    <Link
                                      key={sub.slug}
                                      href={`/dogs-cats?type=${sub.slug}`}
                                      onMouseEnter={() => prefetchRoute("/dogs-cats")}
                                      className="text-xs bg-white px-2 py-1 rounded-full text-amber-600 hover:bg-amber-100 transition-colors"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                              {/* Birds & Fish Category - Featured */}
                              <div className="col-span-2 bg-gradient-to-r from-cyan-50 to-emerald-50 p-4 rounded-xl mb-4">
                                <Link
                                  href="/birds-fish"
                                  onMouseEnter={() => prefetchRoute("/birds-fish")}
                                  className="font-semibold text-sm mb-2 flex items-center gap-2 text-cyan-700 hover:text-cyan-600 transition-colors"
                                >
                                  🐦 Birds & Fish 🐟
                                  <Badge className="bg-emerald-500 text-white text-[10px]">NEW</Badge>
                                </Link>
                                <p className="text-xs text-gray-600 mb-2">Premium birds and exotic aquarium fish</p>
                                <div className="flex gap-2 flex-wrap">
                                  {birdsAndFishCategory.subcategories?.map((sub) => (
                                    <Link
                                      key={sub.slug}
                                      href={`/birds-fish?type=${sub.slug}`}
                                      onMouseEnter={() => prefetchRoute("/birds-fish")}
                                      className="text-xs bg-white px-2 py-1 rounded-full text-cyan-600 hover:bg-cyan-100 transition-colors"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                              {categories.map((category) => (
                                <div key={category.id}>
                                  <Link
                                    href={`/shop/${category.slug}`}
                                    onMouseEnter={() => prefetchRoute(`/shop/${category.slug}`)}
                                    className={cn(
                                      "font-semibold text-sm mb-3 inline-flex items-center gap-2 hover:text-secondary transition-colors",
                                      category.id === "aquarium-fish" && "text-secondary"
                                    )}
                                  >
                                    {category.id === "aquarium-fish" ? (
                                      <Fish className="w-4 h-4" />
                                    ) : null}
                                    {category.name}
                                    {category.id === "aquarium-fish" && (
                                      <Badge variant="coral" className="text-[10px]">HOT</Badge>
                                    )}
                                  </Link>
                                  <div className="flex flex-wrap gap-2">
                                    {category.subcategories?.slice(0, 5).map((sub) => (
                                      <Link
                                        key={sub.slug}
                                        href={`/shop/${category.slug}/${sub.slug}`}
                                        onMouseEnter={() => prefetchRoute(`/shop/${category.slug}/${sub.slug}`)}
                                        className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                      >
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                              <Link
                                href="/shop"
                                onMouseEnter={() => prefetchRoute("/shop")}
                                className="text-sm text-secondary hover:underline font-medium"
                              >
                                View All Products →
                              </Link>
                              <Badge variant="outline" className="text-xs">
                                Free shipping over ₹2000
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <div className="hidden md:block relative">
                <AnimatePresence>
                  {searchOpen ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 250, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Input
                        placeholder="Search fish & accessories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            runSearch();
                          }
                        }}
                        className="pr-10"
                        autoFocus
                        onBlur={() => !searchQuery && setSearchOpen(false)}
                      />
                    </motion.div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:flex"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Wishlist */}
              <Link href="/account/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onMouseEnter={() => prefetchRoute("/account/wishlist")}
                  onFocus={() => prefetchRoute("/account/wishlist")}
                >
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <CartDrawer>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {getItemCount() > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-primary text-xs font-bold rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {getItemCount()}
                    </motion.span>
                  )}
                </Button>
              </CartDrawer>

              {/* Account Dropdown */}
              <div className="hidden sm:block relative group">
                <Button variant="ghost" size="icon" className="relative">
                  {isAuthenticated && currentUser ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-xl shadow-xl border p-2 min-w-[180px]">
                    {isAuthenticated && currentUser ? (
                      <div className="border-b px-3 py-2">
                        <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                        <p className="truncate text-xs text-gray-500">{currentUser.email || currentUser.mobile}</p>
                      </div>
                    ) : (
                      <>
                        <Link href="/auth/signin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                          <User className="w-4 h-4" />
                          Sign In
                        </Link>
                        <Link href="/auth/register" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                          <Sparkles className="w-4 h-4" />
                          Register
                        </Link>
                      </>
                    )}
                    {isAuthenticated && (
                      <>
                        <div className="border-t my-1"></div>
                        {hasAdminAccess ? (
                          <Link href="/owner/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                            <User className="w-4 h-4" />
                            Owner Dashboard
                          </Link>
                        ) : (
                          <>
                            <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                              <User className="w-4 h-4" />
                              My Account
                            </Link>
                            <Link href="/account/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                              <ShoppingCart className="w-4 h-4" />
                              My Orders
                            </Link>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={toggleMobileMenu}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t bg-background overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                {/* Mobile Search */}
                <div className="mb-4">
                  <Input
                    placeholder="Search fish & accessories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        toggleMobileMenu();
                        runSearch();
                      }
                    }}
                    className="w-full"
                  />
                </div>

                {/* Mobile Nav Links */}
                <nav className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={toggleMobileMenu}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium",
                          pathname === link.href
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted",
                          link.highlight && !(link as any).isNew && !(link as any).isDogsCats && "text-secondary",
                          (link as any).isNew && "bg-gradient-to-r from-cyan-50 to-emerald-50 text-cyan-700",
                          (link as any).isDogsCats && "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {link.highlight && !(link as any).isNew && !(link as any).isDogsCats && <Sparkles className="w-4 h-4" />}
                          {link.name}
                        </span>
                        {link.highlight && !(link as any).isNew && !(link as any).isDogsCats && <Badge variant="coral">HOT</Badge>}
                        {(link as any).isNew && <Badge className="bg-emerald-500 text-white">NEW</Badge>}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Categories */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
                  <div className="space-y-3">
                    {/* Dogs & Cats - Featured */}
                    <Link
                      href="/dogs-cats"
                      onClick={toggleMobileMenu}
                      className="col-span-2 px-3 py-3 text-sm bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg hover:from-amber-100 hover:to-orange-100 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2 text-amber-700 font-medium">
                        🐾 Dogs & Cats 🐱
                      </span>
                    </Link>
                    {/* Birds & Fish - Featured */}
                    <Link
                      href="/birds-fish"
                      onClick={toggleMobileMenu}
                      className="col-span-2 px-3 py-3 text-sm bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-lg hover:from-cyan-100 hover:to-emerald-100 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2 text-cyan-700 font-medium">
                        🐦 Birds & Fish 🐟
                      </span>
                      <Badge className="bg-emerald-500 text-white text-xs">NEW</Badge>
                    </Link>
                    {categories.map((category) => (
                      <div key={category.id} className="rounded-lg bg-muted p-3">
                        <Link
                          href={`/shop/${category.slug}`}
                          onClick={toggleMobileMenu}
                          className="mb-2 flex items-center gap-2 text-sm font-semibold"
                        >
                          {category.id === "aquarium-fish" ? (
                            <Fish className="w-4 h-4 text-secondary" />
                          ) : null}
                          {category.name}
                        </Link>
                        <div className="flex flex-wrap gap-2">
                          {category.subcategories?.slice(0, 5).map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/shop/${category.slug}/${sub.slug}`}
                              onClick={toggleMobileMenu}
                              className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Account Links */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Account</p>
                  {isAuthenticated && currentUser ? (
                    <Link
                      href={
                        hasAdminAccess ? '/owner/dashboard'
                        : '/account'
                      }
                      onClick={toggleMobileMenu}
                      className="flex items-center gap-3 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <span className="block">{currentUser.name}</span>
                        <span className="block text-xs text-white/80">View Profile</span>
                      </span>
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/auth/signin"
                        onClick={toggleMobileMenu}
                        className="px-3 py-3 text-sm bg-primary text-white rounded-lg flex items-center justify-center gap-2 font-medium"
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={toggleMobileMenu}
                        className="px-3 py-3 text-sm bg-secondary text-white rounded-lg flex items-center justify-center gap-2 font-medium"
                      >
                        <Sparkles className="w-4 h-4" />
                        Register
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Contact */}
                <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    +91 98765 43210
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Mumbai
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
