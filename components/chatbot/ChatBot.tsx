'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Send, Sparkles, Fish, Bird, ShoppingCart, 
  Heart, Search, HelpCircle, Package, Truck, Phone,
  ChevronDown, Minimize2, Maximize2, ExternalLink
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { birdsAndFishProducts } from '@/lib/birdsAndFishData'
import { formatPrice } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  products?: typeof birdsAndFishProducts
  timestamp: Date
}

// Quick action buttons
const quickActions = [
  { label: '🐟 Show Fish', query: 'show me fish' },
  { label: '🐦 Show Birds', query: 'show me birds' },
  { label: '💰 Best Deals', query: 'best deals' },
  { label: '✨ New Arrivals', query: 'new arrivals' },
  { label: '🏆 Best Sellers', query: 'best sellers' },
  { label: '📦 Shipping Info', query: 'shipping information' },
]

// Bot responses based on keywords
const getBotResponse = (query: string): { message: string; products?: typeof birdsAndFishProducts } => {
  const lowerQuery = query.toLowerCase()
  
  // Greetings
  if (lowerQuery.match(/^(hi|hello|hey|hola|namaste)/)) {
    return {
      message: "Hello! 👋 Welcome to Rainbow Aqua! I'm Bubbles, your friendly pet assistant. How can I help you today?\n\nYou can ask me about:\n🐟 Fish (Freshwater & Marine)\n🐦 Birds\n🎯 Accessories\n💰 Prices & Deals\n📦 Shipping & Orders"
    }
  }

  // Show all fish
  if (lowerQuery.includes('fish') && (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('all'))) {
    const fishProducts = birdsAndFishProducts.filter(p => 
      p.subcategory === 'freshwater-fish' || p.subcategory === 'marine-fish'
    ).slice(0, 6)
    return {
      message: "🐟 Here are our amazing fish! We have both freshwater and marine varieties:",
      products: fishProducts
    }
  }

  // Show freshwater fish
  if (lowerQuery.includes('freshwater')) {
    const freshwaterFish = birdsAndFishProducts.filter(p => p.subcategory === 'freshwater-fish').slice(0, 6)
    return {
      message: "🐠 Here are our freshwater fish - perfect for beginners and experts alike!",
      products: freshwaterFish
    }
  }

  // Show marine fish
  if (lowerQuery.includes('marine') || lowerQuery.includes('saltwater')) {
    const marineFish = birdsAndFishProducts.filter(p => p.subcategory === 'marine-fish').slice(0, 6)
    return {
      message: "🌊 Check out our stunning marine fish collection!",
      products: marineFish
    }
  }

  // Show birds
  if (lowerQuery.includes('bird') && (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('all'))) {
    const birdProducts = birdsAndFishProducts.filter(p => p.subcategory === 'birds').slice(0, 6)
    return {
      message: "🐦 Here are our beautiful feathered friends!",
      products: birdProducts
    }
  }

  // Show accessories
  if (lowerQuery.includes('accessor') || lowerQuery.includes('equipment') || lowerQuery.includes('tank') || lowerQuery.includes('filter')) {
    const accessories = birdsAndFishProducts.filter(p => p.subcategory === 'fish-accessories').slice(0, 6)
    return {
      message: "🎯 Here are essential accessories for your aquarium!",
      products: accessories
    }
  }

  // Best deals / discounts
  if (lowerQuery.includes('deal') || lowerQuery.includes('discount') || lowerQuery.includes('offer') || lowerQuery.includes('sale')) {
    const dealsProducts = birdsAndFishProducts
      .filter(p => p.originalPrice && p.originalPrice > p.price)
      .sort((a, b) => {
        const discountA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100
        const discountB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100
        return discountB - discountA
      })
      .slice(0, 6)
    return {
      message: "💰 Check out our best deals with amazing discounts!",
      products: dealsProducts
    }
  }

  // New arrivals
  if (lowerQuery.includes('new') && (lowerQuery.includes('arrival') || lowerQuery.includes('latest'))) {
    const newProducts = birdsAndFishProducts.filter(p => p.isNew).slice(0, 6)
    return {
      message: "✨ Fresh arrivals just for you! Check out what's new:",
      products: newProducts
    }
  }

  // Best sellers
  if (lowerQuery.includes('best') && (lowerQuery.includes('seller') || lowerQuery.includes('popular'))) {
    const bestSellers = birdsAndFishProducts.filter(p => p.tags?.includes('best-seller')).slice(0, 6)
    return {
      message: "🏆 Our most popular products that customers love!",
      products: bestSellers
    }
  }

  // Betta fish specific
  if (lowerQuery.includes('betta')) {
    const bettaProducts = birdsAndFishProducts.filter(p => 
      p.name.toLowerCase().includes('betta')
    ).slice(0, 4)
    return {
      message: "🐠 Betta fish are stunning! Here are our beautiful Bettas with various tail types:",
      products: bettaProducts
    }
  }

  // Goldfish specific
  if (lowerQuery.includes('goldfish') || lowerQuery.includes('gold fish')) {
    const goldfishProducts = birdsAndFishProducts.filter(p => 
      p.name.toLowerCase().includes('goldfish')
    ).slice(0, 4)
    return {
      message: "🐟 Classic and beautiful! Check out our Goldfish varieties:",
      products: goldfishProducts
    }
  }

  // Parrot / African Grey
  if (lowerQuery.includes('parrot') || lowerQuery.includes('african grey')) {
    const parrotProducts = birdsAndFishProducts.filter(p => 
      p.name.toLowerCase().includes('parrot') || p.name.toLowerCase().includes('african grey')
    ).slice(0, 4)
    return {
      message: "🦜 Parrots are incredibly intelligent! Here are our options:",
      products: parrotProducts
    }
  }

  // Budgie / Parakeet
  if (lowerQuery.includes('budgie') || lowerQuery.includes('parakeet')) {
    const budgieProducts = birdsAndFishProducts.filter(p => 
      p.name.toLowerCase().includes('budgie') || p.name.toLowerCase().includes('parakeet')
    ).slice(0, 4)
    return {
      message: "🐦 Budgies make wonderful companions! Here are our colorful options:",
      products: budgieProducts
    }
  }

  // Price related
  if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
    const affordableProducts = birdsAndFishProducts
      .sort((a, b) => a.price - b.price)
      .slice(0, 6)
    return {
      message: "💵 Here are our most affordable options to start your pet journey:",
      products: affordableProducts
    }
  }

  // Shipping info
  if (lowerQuery.includes('ship') || lowerQuery.includes('delivery') || lowerQuery.includes('deliver')) {
    return {
      message: "📦 **Shipping Information:**\n\n🚚 Free shipping on orders over ₹2,000\n⏱️ Delivery within 2-5 business days\n🐟 Live fish shipped with oxygen packs\n🐦 Birds delivered with care crates\n📍 We deliver across Tamil Nadu!\n\nNeed help with a specific order? Contact us at +91 98765 43210"
    }
  }

  // Returns / refunds
  if (lowerQuery.includes('return') || lowerQuery.includes('refund') || lowerQuery.includes('exchange')) {
    return {
      message: "🔄 **Returns & Refunds:**\n\n✅ 7-day live arrival guarantee\n✅ Full refund for DOA (Dead on Arrival)\n✅ Photo/video required within 2 hours of delivery\n✅ Easy exchange process\n\nContact our support team for any concerns!"
    }
  }

  // Contact
  if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('call') || lowerQuery.includes('support')) {
    return {
      message: "📞 **Contact Us:**\n\n📱 Phone: +91 98765 43210\n📧 Email: hello@rainbowaqua.in\n📍 Location: No. 45, South Car Street, Tirunelveli Town - 627006, Tamil Nadu\n⏰ Hours: 9 AM - 8 PM (Mon-Sat)\n\nWe're always happy to help!"
    }
  }

  // Care tips
  if (lowerQuery.includes('care') || lowerQuery.includes('tips') || lowerQuery.includes('how to')) {
    return {
      message: "💡 **Pet Care Tips:**\n\n🐟 **Fish Care:**\n• Change 25% water weekly\n• Don't overfeed\n• Test water parameters regularly\n\n🐦 **Bird Care:**\n• Fresh water daily\n• Varied diet with seeds & fruits\n• Regular cage cleaning\n\nWant specific care guides? Just ask about any pet!"
    }
  }

  // Thank you
  if (lowerQuery.includes('thank') || lowerQuery.includes('thanks')) {
    return {
      message: "You're welcome! 😊 It was my pleasure helping you. If you have any more questions about our pets or products, feel free to ask anytime!\n\n🐟🐦 Happy pet parenting! 🐦🐟"
    }
  }

  // Bye
  if (lowerQuery.includes('bye') || lowerQuery.includes('goodbye')) {
    return {
      message: "Goodbye! 👋 Thank you for visiting Rainbow Aqua. Come back soon!\n\nUse code **AQUAFIRST50** for 25% off your first order! 🎉"
    }
  }

  // Search for specific product
  const searchResults = birdsAndFishProducts.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  ).slice(0, 4)

  if (searchResults.length > 0) {
    return {
      message: `🔍 Found ${searchResults.length} products matching "${query}":`,
      products: searchResults
    }
  }

  // Default response
  return {
    message: "I'm not sure I understood that. Here are some things I can help you with:\n\n🐟 \"Show me fish\" - Browse our fish collection\n🐦 \"Show me birds\" - See our bird varieties\n💰 \"Best deals\" - Find discounted products\n📦 \"Shipping info\" - Delivery details\n📞 \"Contact\" - Get in touch with us\n\nOr simply type what you're looking for!"
  }
}

const getCleanBotResponse = (query: string): { message: string; products?: typeof birdsAndFishProducts } => {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.match(/^(hi|hello|hey|hola|namaste)/)) {
    return {
      message: "Hello! Welcome to Rainbow Aqua. I can help with fish, birds, accessories, prices, deals, shipping, returns, and order support."
    }
  }

  if (lowerQuery.includes('fish') && (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('all'))) {
    return {
      message: "Here are our available fish, including freshwater and marine varieties:",
      products: birdsAndFishProducts.filter(p => p.subcategory === 'freshwater-fish' || p.subcategory === 'marine-fish').slice(0, 6)
    }
  }

  if (lowerQuery.includes('freshwater')) {
    return {
      message: "Here are our freshwater fish options:",
      products: birdsAndFishProducts.filter(p => p.subcategory === 'freshwater-fish').slice(0, 6)
    }
  }

  if (lowerQuery.includes('marine') || lowerQuery.includes('saltwater')) {
    return {
      message: "Here are our marine fish options:",
      products: birdsAndFishProducts.filter(p => p.subcategory === 'marine-fish').slice(0, 6)
    }
  }

  if (lowerQuery.includes('bird') && (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('all'))) {
    return {
      message: "Here are our bird options:",
      products: birdsAndFishProducts.filter(p => p.subcategory === 'birds').slice(0, 6)
    }
  }

  if (lowerQuery.includes('accessor') || lowerQuery.includes('equipment') || lowerQuery.includes('tank') || lowerQuery.includes('filter')) {
    return {
      message: "Here are essential aquarium accessories:",
      products: birdsAndFishProducts.filter(p => p.subcategory === 'fish-accessories').slice(0, 6)
    }
  }

  if (lowerQuery.includes('deal') || lowerQuery.includes('discount') || lowerQuery.includes('offer') || lowerQuery.includes('sale')) {
    return {
      message: "Here are the best current deals:",
      products: birdsAndFishProducts
        .filter(p => p.originalPrice && p.originalPrice > p.price)
        .sort((a, b) => ((b.originalPrice! - b.price) / b.originalPrice!) - ((a.originalPrice! - a.price) / a.originalPrice!))
        .slice(0, 6)
    }
  }

  if (lowerQuery.includes('new') && (lowerQuery.includes('arrival') || lowerQuery.includes('latest'))) {
    return {
      message: "Here are the newest arrivals:",
      products: birdsAndFishProducts.filter(p => p.isNew).slice(0, 6)
    }
  }

  if (lowerQuery.includes('best') && (lowerQuery.includes('seller') || lowerQuery.includes('popular'))) {
    return {
      message: "Here are our most popular products:",
      products: birdsAndFishProducts.filter(p => p.tags?.includes('best-seller')).slice(0, 6)
    }
  }

  if (lowerQuery.includes('ship') || lowerQuery.includes('delivery') || lowerQuery.includes('deliver')) {
    return {
      message: "Shipping information:\n\nFree shipping on orders over Rs. 2,000.\nDelivery usually takes 2-5 business days.\nLive fish are shipped with oxygen packs.\nFor order help, contact +91 98765 43210."
    }
  }

  if (lowerQuery.includes('return') || lowerQuery.includes('refund') || lowerQuery.includes('exchange')) {
    return {
      message: "Returns and refunds:\n\nEligible unused products can be returned within 7 days. For live fish issues, send clear photos or video within 2 hours of delivery so support can review a replacement or refund."
    }
  }

  if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('call') || lowerQuery.includes('support')) {
    return {
      message: "Contact support:\n\nPhone: +91 98765 43210\nEmail: hello@rainbowaqua.in\nHours: 9 AM - 8 PM, Monday to Saturday."
    }
  }

  if (lowerQuery.includes('care') || lowerQuery.includes('tips') || lowerQuery.includes('how to')) {
    return {
      message: "Care tips:\n\nFish: change part of the water weekly, avoid overfeeding, and test water regularly.\nBirds: provide fresh water daily, a varied diet, and regular cage cleaning.\nAsk about a specific pet for more targeted help."
    }
  }

  if (lowerQuery.includes('thank') || lowerQuery.includes('thanks')) {
    return {
      message: "You're welcome. Ask anytime if you need help with products, shipping, returns, or care."
    }
  }

  if (lowerQuery.includes('bye') || lowerQuery.includes('goodbye')) {
    return {
      message: "Goodbye, and thanks for visiting Rainbow Aqua."
    }
  }

  const products = birdsAndFishProducts.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  ).slice(0, 4)

  if (products.length > 0) {
    return {
      message: `Found ${products.length} products matching "${query}":`,
      products
    }
  }

  return {
    message: "I can help with fish, birds, accessories, prices, best deals, shipping, returns, contact details, or care tips. Try asking for one of those."
  }
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi, I'm Bubbles from Rainbow Aqua. I can help with fish, birds, accessories, prices, shipping, returns, and care questions.",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = useCallback(() => {
    const query = inputValue.trim()
    if (!query || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const response = getCleanBotResponse(query)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.message,
        products: response.products,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 800 + Math.random() * 500)
  }, [inputValue, isTyping])

  const handleQuickAction = (query: string) => {
    if (isTyping) return
    setInputValue(query)
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: query,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setIsTyping(true)

      setTimeout(() => {
        const response = getCleanBotResponse(query)
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.message,
          products: response.products,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 800)
    }, 100)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-32 sm:bottom-24 right-4 sm:right-6 z-50 group"
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Button */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center overflow-hidden">
              {/* Animated fish/bird GIF placeholder - using animated icon */}
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Fish className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              
              {/* Bubbles animation */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
                  style={{ left: 10 + i * 10, bottom: 5 }}
                  animate={{
                    y: [-5, -20],
                    opacity: [0.6, 0],
                    scale: [0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: Infinity
                  }}
                />
              ))}
            </div>
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 top-[45%] -translate-y-1/2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap hidden sm:block"
            >
              Chat with Bubbles! 🐟
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-white dark:bg-slate-800" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 'auto' : undefined
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              "bottom-0 right-0 sm:bottom-24 sm:right-6 lg:bottom-8",
              "w-full h-[100dvh] sm:w-[380px] sm:h-[520px] sm:max-h-[80vh]",
              isMinimized && "sm:h-auto"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Fish className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    Bubbles
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </h3>
                  <p className="text-white/80 text-xs">Your Pet Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.type === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5",
                        message.type === 'user' 
                          ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-br-md"
                          : "bg-white dark:bg-slate-800 shadow-md rounded-bl-md"
                      )}>
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        
                        {/* Product cards */}
                        {message.products && message.products.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.products.map((product) => (
                              <motion.div 
                                key={product.id}
                                className="bg-slate-50 dark:bg-slate-700 rounded-xl overflow-hidden"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Link 
                                  href={`/product/${product.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="flex gap-3 p-2"
                                >
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                                    <Image
                                      src={product.images[0]}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                    {product.isNew && (
                                      <Badge className="absolute top-0 left-0 text-[8px] px-1 py-0 bg-emerald-500">NEW</Badge>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-900 dark:text-white line-clamp-1">
                                      {product.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                      {product.subcategory?.replace('-', ' ')}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-bold text-cyan-600">
                                        {formatPrice(product.price)}
                                      </span>
                                      {product.originalPrice && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                          {formatPrice(product.originalPrice)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <ExternalLink className="w-4 h-4 text-cyan-500" />
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                            {/* View All Button */}
                            <Link
                              href="/birds-fish"
                              onClick={() => setIsOpen(false)}
                              className="block"
                            >
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs h-8 border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                              >
                                View All Products →
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-slate-400 rounded-full"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.query)}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 safe-area-bottom">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask about fish, birds, prices..."
                      className="flex-1 rounded-full border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
