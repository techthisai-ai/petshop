'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Parallax } from 'react-scroll-parallax'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  CreditCard
} from 'lucide-react'

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/shop' },
    { name: 'Live Fish', href: '/shop?category=fish' },
    { name: 'Aquarium Tanks', href: '/shop?category=tanks' },
    { name: 'Filters & Pumps', href: '/shop?category=filters' },
    { name: 'Plants & Decor', href: '/shop?category=plants' },
    { name: 'Sale', href: '/shop?filter=sale' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'Track Order', href: '/track' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Care Guide', href: '/care' },
    { name: 'Careers', href: '/careers' },
    { name: 'Our Brands', href: '/brands' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Admin Login', href: '/admin/login' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
]

const paymentMethods = [
  'Visa', 'Mastercard', 'RuPay', 'UPI', 'GPay', 'PhonePe', 'Paytm', 'COD'
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-dark text-white overflow-hidden">
      {/* Decorative Bubbles */}
      <Parallax speed={-5} className="absolute top-20 left-10 opacity-5">
        <span className="text-[200px]">🫧</span>
      </Parallax>
      <Parallax speed={-10} className="absolute bottom-40 right-10 opacity-5">
        <span className="text-[150px]">🐠</span>
      </Parallax>

      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-heading font-bold text-2xl md:text-3xl mb-2">
                Dive Into Savings! 🐠
              </h3>
              <p className="text-gray-400">
                Subscribe for exclusive deals, aquarium care tips & 15% off your first order
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                           text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="btn-primary px-6"
              >
                <span>Subscribe</span>
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="text-3xl">🐠</span>
              <span className="font-heading font-bold text-2xl gradient-text">Cloning Aqua Pets</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Premium aquarium supplies for your aquatic companions. Quality products,
              healthy fish, happy hobbyists.
            </p>
            <div className="space-y-3 text-sm text-gray-400">
              <a href="tel:+918870777420" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +91 88707 77420
              </a>
              <a href="mailto:rainbowaquariumnellai@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                rainbowaquariumnellai@gmail.com
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Salem, Tamil Nadu, India
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 
                               transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 
                               transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 
                               transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 
                               transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center
                             hover:bg-primary-500 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center">
              © {new Date().getFullYear()} Cloning Aqua Pets. All rights reserved. Made with 💙 for aquarists
            </p>

            {/* Payment Methods */}
            <Parallax speed={2}>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {paymentMethods.join(' • ')}
                </span>
              </div>
            </Parallax>
          </div>
        </div>
      </div>

      {/* Back to Top Button - Hidden on mobile since we have bottom nav */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        className="hidden lg:flex fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 
                   rounded-full items-center justify-center shadow-lg z-40
                   hover:shadow-primary-500/50 transition-shadow"
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6 text-white" />
      </motion.button>
      
      {/* Mobile bottom padding for nav bar */}
      <div className="h-20 lg:hidden" />
    </footer>
  )
}

