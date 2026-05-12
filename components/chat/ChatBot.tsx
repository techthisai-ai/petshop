'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Send, MessageCircle, Sparkles, PawPrint, 
  Phone, Mail, Clock, MapPin, ShoppingBag, Heart,
  HelpCircle, Truck, CreditCard, RefreshCw
} from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  timestamp: Date
  quickReplies?: string[]
}

// Pre-defined Q&A database
const qaDatabase: Record<string, { answer: string; quickReplies?: string[] }> = {
  // Greetings
  'hi': { 
    answer: "Hey there! 🐾 I'm Whiskers, your BowPaw assistant! How can I help you today?",
    quickReplies: ['Pet prices', 'Delivery info', 'Pet care tips', 'Contact support']
  },
  'hello': { 
    answer: "Hello! 😺 Welcome to BowPaw! I'm here to help you find the perfect pet or answer any questions!",
    quickReplies: ['Browse pets', 'Services', 'Store location', 'Talk to human']
  },
  'hey': { 
    answer: "Hey! 🐱 Nice to meet you! Looking for a furry friend or need help with something?",
    quickReplies: ['Show me dogs', 'Show me cats', 'Pet supplies', 'Help']
  },

  // Pet inquiries
  'pet prices': { 
    answer: "Our pet prices vary by breed! 🏷️\n\n🐕 Dogs: ₹2,000 - ₹45,000\n🐱 Cats: ₹500 - ₹50,000\n🐰 Rabbits: ₹1,500 - ₹5,000\n🐠 Fish: ₹20 - ₹300\n🐦 Birds: ₹300 - ₹15,000\n\nAll prices include health certificate!",
    quickReplies: ['Popular dogs', 'Popular cats', 'Budget pets', 'Premium breeds']
  },
  'dogs': { 
    answer: "We have amazing dog breeds! 🐕\n\n⭐ Popular: Labrador (₹15,000), Golden Retriever (₹18,000)\n💚 Best for India: Indian Pariah (₹2,000)\n🏠 Apartment-friendly: Pug (₹10,000), Shih Tzu (₹15,000)\n\nAll are health certified & vaccinated!",
    quickReplies: ['Dog prices', 'Dog care', 'Book visit', 'See all dogs']
  },
  'cats': { 
    answer: "We have lovely cats! 🐱\n\n⭐ Popular: Persian (₹15,000), Siamese (₹12,000)\n💚 Best for India: Desi Cat (₹500)\n🌟 Rare: Maine Coon (₹35,000), Bengal (₹45,000)\n\nAll cats are litter trained!",
    quickReplies: ['Cat prices', 'Cat care', 'Book visit', 'See all cats']
  },
  'rabbits': { 
    answer: "Our rabbits are so fluffy! 🐰\n\nHolland Lop (₹3,000) - Floppy ears!\nNetherland Dwarf (₹2,500) - Tiny & cute!\nLionhead (₹2,800) - Fluffy mane!\n\nPerfect for apartments!",
    quickReplies: ['Rabbit care', 'Book visit', 'See all rabbits']
  },
  'fish': { 
    answer: "Beautiful fish available! 🐠\n\nBetta (₹150) - Stunning colors!\nGoldfish (₹50) - Classic beauty!\nNeon Tetra (₹25) - Schooling fish!\n\nWe also sell tanks & accessories!",
    quickReplies: ['Fish care', 'Tank setup', 'See all fish']
  },
  'birds': { 
    answer: "Chirpy birds await! 🐦\n\nBudgie (₹500) - Great talkers!\nCockatiel (₹2,500) - Musical!\nLovebirds (₹1,500) - Colorful pairs!\n\nCages & food available too!",
    quickReplies: ['Bird care', 'Book visit', 'See all birds']
  },

  // Services
  'services': { 
    answer: "Our pet services include: 🛎️\n\n🚶 Dog Walking - ₹299/walk\n🏠 Pet Sitting - ₹799/visit\n✂️ Grooming - ₹499+\n🏨 Boarding - ₹999/night\n🚗 Pet Taxi - ₹399\n🎓 Training - ₹1,499/session\n\nAll across Tamil Nadu!",
    quickReplies: ['Book service', 'Service areas', 'Call us']
  },
  'grooming': { 
    answer: "Grooming packages! ✨\n\n🛁 Basic Bath - ₹499\n✂️ Full Grooming - ₹699\n💆 Luxury Spa - ₹999\n\nIncludes nail trim, ear cleaning & more!",
    quickReplies: ['Book grooming', 'Dog grooming', 'Cat grooming']
  },

  // Delivery & Shipping
  'delivery': { 
    answer: "Delivery info! 🚚\n\n📍 Tamil Nadu: 2-3 days\n📍 Other states: 4-7 days\n💰 Free delivery above ₹4,000!\n\nPets are delivered with care by trained handlers!",
    quickReplies: ['Track order', 'Delivery cities', 'Pet delivery']
  },
  'delivery info': { 
    answer: "We deliver across India! 🇮🇳\n\n⚡ Same-day in major TN cities\n📦 Safe pet transport\n🎁 Free shipping over ₹4,000\n\nPets come with health certificate!",
    quickReplies: ['Pet delivery', 'Product delivery', 'Track order']
  },

  // Payment
  'payment': { 
    answer: "Payment options! 💳\n\n✅ UPI (GPay, PhonePe, Paytm)\n✅ Debit/Credit Cards\n✅ Net Banking\n✅ Cash on Delivery\n✅ EMI available!\n\nAll payments are 100% secure!",
    quickReplies: ['EMI options', 'Refund policy', 'Secure payment']
  },

  // Store & Contact
  'store location': { 
    answer: "Visit us! 📍\n\n🏪 Rainbow Aqua and Pets\nNo. 45, South Car Street\nTirunelveli Town - 627006\nTamil Nadu, India\n\n⏰ Open: 9 AM - 9 PM (All days)\n📞 1800-123-PAWS (Toll free)",
    quickReplies: ['Get directions', 'Store hours', 'Call store']
  },
  'contact': { 
    answer: "Get in touch! 📞\n\n☎️ 1800-123-PAWS (Toll free)\n📱 +91 98765 43210 (WhatsApp)\n📧 hello@bowpaw.com\n\nWe respond within 30 mins!",
    quickReplies: ['Call now', 'WhatsApp', 'Email us']
  },
  'contact support': { 
    answer: "Support options! 🤝\n\n📞 Call: 1800-123-PAWS\n💬 WhatsApp: +91 98765 43210\n📧 Email: support@bowpaw.com\n\nAvailable 9 AM - 9 PM!",
    quickReplies: ['Call now', 'Email', 'Live chat']
  },

  // Pet Care
  'pet care': { 
    answer: "Pet care tips! 💚\n\n🍽️ Feed quality food\n💧 Fresh water always\n🏥 Regular vet visits\n🎾 Daily exercise/play\n❤️ Lots of love!\n\nWant specific care tips?",
    quickReplies: ['Dog care', 'Cat care', 'First pet tips']
  },
  'pet care tips': { 
    answer: "Top care tips! 🌟\n\n1️⃣ Regular vaccinations\n2️⃣ Balanced diet\n3️⃣ Clean water daily\n4️⃣ Exercise & play\n5️⃣ Grooming routine\n6️⃣ Love & attention!",
    quickReplies: ['Dog care', 'Cat care', 'Vet consultation']
  },
  'dog care': { 
    answer: "Dog care essentials! 🐕\n\n🍖 Feed 2x daily\n🚶 Walk 30-60 mins\n🛁 Bath every 2-4 weeks\n💉 Annual vaccinations\n❤️ Lots of cuddles!\n\nNeed product recommendations?",
    quickReplies: ['Dog food', 'Dog toys', 'Dog health']
  },
  'cat care': { 
    answer: "Cat care basics! 🐱\n\n🐟 Quality cat food\n🚰 Fresh water\n🧹 Clean litter daily\n🎯 Play sessions\n😺 Scratching post!\n\nCats are easy to care for!",
    quickReplies: ['Cat food', 'Cat toys', 'Litter tips']
  },

  // Returns & Refunds
  'return': { 
    answer: "Return policy! 🔄\n\n✅ 7-day health guarantee on pets\n✅ 30-day returns on products\n✅ Full refund if pet is unwell\n\nWe want you to be happy!",
    quickReplies: ['Start return', 'Refund status', 'Contact support']
  },
  'refund': { 
    answer: "Refund info! 💰\n\n⏱️ Processed in 3-5 days\n💳 Refund to original payment\n🐾 Pet health issues = full refund\n\nContact us for any concerns!",
    quickReplies: ['Request refund', 'Track refund', 'Help']
  },

  // General
  'help': { 
    answer: "I can help with! 🙋\n\n🐾 Pet information & prices\n🚚 Delivery & shipping\n💳 Payment options\n📍 Store location\n🛎️ Services booking\n💬 General queries\n\nJust ask!",
    quickReplies: ['Pets', 'Services', 'Orders', 'Contact']
  },
  'thank you': { 
    answer: "You're welcome! 😊 Happy to help! Is there anything else I can assist you with?",
    quickReplies: ['That\'s all', 'More questions', 'Talk to human']
  },
  'thanks': { 
    answer: "My pleasure! 🐾 Feel free to ask if you need anything else!",
    quickReplies: ['Bye', 'More help', 'Contact support']
  },
  'bye': { 
    answer: "Goodbye! 👋 Thank you for visiting BowPaw! Come back soon for more furry friends! 🐾💕",
    quickReplies: ['Start over', 'Browse pets', 'Contact us']
  },

  // Talk to human
  'talk to human': { 
    answer: "Sure! Connect with our team! 🤝\n\n📞 Call: 1800-123-PAWS\n💬 WhatsApp: +91 98765 43210\n\nOur pet experts are available 9 AM - 9 PM!",
    quickReplies: ['Call now', 'WhatsApp', 'Email']
  },
}

// Find best matching answer
const findAnswer = (input: string): { answer: string; quickReplies?: string[] } => {
  const normalizedInput = input.toLowerCase().trim()
  
  // Direct match
  if (qaDatabase[normalizedInput]) {
    return qaDatabase[normalizedInput]
  }
  
  // Partial match
  for (const [key, value] of Object.entries(qaDatabase)) {
    if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
      return value
    }
  }
  
  // Keyword matching
  const keywords: Record<string, string> = {
    'price': 'pet prices',
    'cost': 'pet prices',
    'how much': 'pet prices',
    'dog': 'dogs',
    'puppy': 'dogs',
    'cat': 'cats',
    'kitten': 'cats',
    'rabbit': 'rabbits',
    'bunny': 'rabbits',
    'fish': 'fish',
    'bird': 'birds',
    'parrot': 'birds',
    'groom': 'grooming',
    'bath': 'grooming',
    'haircut': 'grooming',
    'deliver': 'delivery',
    'ship': 'delivery',
    'pay': 'payment',
    'card': 'payment',
    'upi': 'payment',
    'store': 'store location',
    'address': 'store location',
    'location': 'store location',
    'visit': 'store location',
    'call': 'contact',
    'phone': 'contact',
    'whatsapp': 'contact',
    'service': 'services',
    'walk': 'services',
    'sitting': 'services',
    'care': 'pet care',
    'feed': 'pet care',
    'return': 'return',
    'refund': 'refund',
    'money back': 'refund',
    'help': 'help',
    'human': 'talk to human',
    'agent': 'talk to human',
    'person': 'talk to human',
  }
  
  for (const [keyword, key] of Object.entries(keywords)) {
    if (normalizedInput.includes(keyword)) {
      return qaDatabase[key]
    }
  }
  
  // Default response
  return {
    answer: "I'm not sure I understand! 🤔 Could you try asking differently? Or choose from these options:",
    quickReplies: ['Pets', 'Services', 'Delivery', 'Contact', 'Help']
  }
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          id: '1',
          type: 'bot',
          text: "Meow! 🐱 I'm Whiskers, your BowPaw assistant! How can I help you find your perfect pet today?",
          timestamp: new Date(),
          quickReplies: ['Browse pets', 'Pet prices', 'Services', 'Help']
        }])
      }, 500)
    }
  }, [isOpen, messages.length])

  // Send message
  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate bot typing
    setTimeout(() => {
      const response = findAnswer(text)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response.answer,
        timestamp: new Date(),
        quickReplies: response.quickReplies
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 800 + Math.random() * 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  return (
    <>
      {/* Chat Button - Cute Cats GIF */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed right-4 z-[45] ${isOpen ? 'hidden' : 'block'}`}
        style={{ bottom: 'max(calc(5rem + env(safe-area-inset-bottom, 0px)), 6rem)' }}
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative"
        >
          {/* Cute Cats GIF Button - Full Visible */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-visible bg-transparent">
            <Image
              src="/images/cute-cats.gif"
              alt="Chat with us"
              width={120}
              height={120}
              className="object-contain w-full h-full"
              unoptimized
            />
          </div>
          
          {/* Notification Badge */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          >
            <span className="text-white text-xs font-bold">1</span>
          </motion.div>
          
          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="absolute -top-10 -left-16 sm:-left-12 bg-white px-3 py-1.5 rounded-2xl shadow-lg text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap border border-pink-200"
          >
            Need help? 🐾
            <div className="absolute -bottom-1 right-3 w-3 h-3 bg-white transform rotate-45 border-r border-b border-pink-200" />
          </motion.div>
        </motion.div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[55] w-full sm:w-[380px] h-[100dvh] sm:h-[600px] sm:max-h-[80vh] bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 p-4 text-white flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-visible p-1">
                  <Image
                    src="/images/cute-cats.gif"
                    alt="Whiskers"
                    width={56}
                    height={56}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Whiskers & Mochi</h3>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online • Typically replies instantly
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                    {message.type === 'bot' && (
                      <div className="flex items-end gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg overflow-visible bg-white flex-shrink-0 shadow-sm p-0.5">
                          <Image
                            src="/images/cute-cats.gif"
                            alt="Bot"
                            width={32}
                            height={32}
                            className="object-contain w-full h-full"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md'
                          : 'bg-white text-gray-700 shadow-md rounded-bl-md border border-pink-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    
                    {/* Quick Replies */}
                    {message.type === 'bot' && message.quickReplies && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.quickReplies.map((reply, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickReply(reply)}
                            className="px-3 py-1.5 bg-white border border-pink-200 text-pink-600 text-xs sm:text-sm rounded-full hover:bg-pink-50 transition-colors shadow-sm"
                          >
                            {reply}
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg overflow-visible bg-white flex-shrink-0 shadow-sm p-0.5">
                    <Image
                      src="/images/cute-cats.gif"
                      alt="Typing"
                      width={32}
                      height={32}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-md border border-pink-100">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 bg-pink-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-pink-100">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-pink-50 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm border border-pink-100"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                Powered by BowPaw 🐾
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
