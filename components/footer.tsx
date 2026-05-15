"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Fish,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CreditCard,
  Truck,
  Shield,
  Headphones,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ₹2000" },
  { icon: Shield, title: "Live Arrival", desc: "100% Guarantee" },
  { icon: CreditCard, title: "Secure Payment", desc: "Razorpay & COD" },
  { icon: Headphones, title: "24/7 Support", desc: "Expert Help" },
];

const footerLinks = {
  shop: [
    { name: "Aquarium Fish", href: "/shop/aquarium-fish" },
    { name: "Cloned Fish", href: "/shop/aquarium-fish/cloned-fish" },
    { name: "Dogs", href: "/shop/dogs-cats/dog-food" },
    { name: "Cats", href: "/shop/dogs-cats/cat-food" },

    { name: "Accessories", href: "/shop/accessories" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
    { name: "Store Locator", href: "/stores" },
  ],
  support: [
    { name: "FAQ", href: "/faq" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Returns", href: "/returns" },
    { name: "Track Order", href: "/track" },
    { name: "Size Guide", href: "/size-guide" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refunds" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-white safe-area-bottom">
      {/* Features Bar */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="p-2 sm:p-3 bg-secondary/20 rounded-full flex-shrink-0">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm">{feature.title}</p>
                  <p className="text-[10px] sm:text-xs text-white/60">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-secondary to-accent p-1.5 sm:p-2 rounded-full">
                <Fish className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-2xl font-bold">Rainbow Aqua</h2>
                <p className="text-[10px] sm:text-xs text-white/60">Premium Fish & Pets</p>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 max-w-sm">
              India&apos;s premier destination for premium aquarium fish and pets.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a href="#" className="p-2 sm:p-2.5 bg-white/10 rounded-full hover:bg-secondary active:scale-95 transition-all">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="p-2 sm:p-2.5 bg-white/10 rounded-full hover:bg-secondary active:scale-95 transition-all">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="p-2 sm:p-2.5 bg-white/10 rounded-full hover:bg-secondary active:scale-95 transition-all">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="p-2 sm:p-2.5 bg-white/10 rounded-full hover:bg-secondary active:scale-95 transition-all">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Shop</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.shop.slice(0, 5).map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs sm:text-sm text-white/70 hover:text-secondary active:text-secondary transition-colors py-1 block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.company.slice(0, 5).map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs sm:text-sm text-white/70 hover:text-secondary active:text-secondary transition-colors py-1 block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support - Hidden on smallest screens */}
          <div className="hidden sm:block">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.support.slice(0, 5).map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs sm:text-sm text-white/70 hover:text-secondary active:text-secondary transition-colors py-1 block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Stay Connected</h3>
            <p className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3">Get updates & offers!</p>
            <div className="flex gap-2 mb-3 sm:mb-4">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm h-9 sm:h-10"
              />
              <Button variant="secondary" size="sm" className="px-3 h-9 sm:h-10">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/70">
              <a href="tel:+918870777420" className="flex items-center gap-2 py-1 hover:text-secondary active:text-secondary transition-colors">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                +91 88707 77420
              </a>
              <a href="mailto:rainbowaquariumnellai@gmail.com" className="flex items-center gap-2 py-1 hover:text-secondary active:text-secondary transition-colors">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                rainbowaquariumnellai@gmail.com
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                Mumbai, India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}  
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-white/70">
              <span>© 2025 Rainbow Aqua</span>
              <span className="hidden sm:inline">•</span>
              <a
                href="https://www.thisaitech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 hover:text-secondary transition-colors"
              >
                <span className="hidden sm:inline">Powered by</span>
                <span className="font-semibold text-secondary">ThisAI</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-secondary w-4 h-4 sm:w-5 sm:h-5"
                >
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 20 C12 15, 18 12, 20 12 C22 12, 28 15, 28 20 C28 25, 22 28, 20 28 C18 28, 12 25, 12 20"
                    fill="currentColor"
                  />
                  <circle cx="16" cy="18" r="2" fill="white" />
                  <path d="M28 20 L35 15 L35 25 Z" fill="currentColor" />
                </svg>
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-sm text-white/70">
              {footerLinks.legal.map((link) => (
                <Link key={link.name} href={link.href} className="hover:text-secondary active:text-secondary transition-colors py-1">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

