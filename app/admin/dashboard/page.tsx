'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, Package, Users, DollarSign, 
  TrendingUp, Eye, ChevronDown, LogOut, 
  PawPrint, RefreshCw, Search, Filter,
  CheckCircle, Clock, Truck, XCircle, ArrowRight, UserCircle
} from 'lucide-react'
import { useAuthStore, Order, UserCart } from '@/store/useAuthStore'
import { isAdminEmail } from '@/lib/authConfig'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminDashboard() {
  const router = useRouter()
  const { 
    currentUser, 
    isAuthenticated, 
    logout, 
    getAllUserCarts, 
    getAllOrders,
    updateOrderStatus,
    fetchAdminData,
    users,
    switchAccount
  } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'carts' | 'users'>('overview')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)

  useEffect(() => {
    if (currentUser?.role === 'owner' && isAdminEmail(currentUser.email)) {
      fetchAdminData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Protect route — middleware handles redirect, this is a safety net
  if (!currentUser || currentUser.role !== 'owner' || !isAdminEmail(currentUser.email)) {
    return null
  }

  const orders = getAllOrders()
  const userCarts = getAllUserCarts()

  // Stats
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const openNotifications = pendingOrders
  const totalOrders = orders.length
  const activeUsers = users.filter(u => u.role === 'user').length

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-cyan-100 text-cyan-700'
      case 'processing': return 'bg-purple-100 text-purple-700'
      case 'shipped': return 'bg-indigo-100 text-indigo-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <RefreshCw className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const displayStatus = (status: Order['status']) => status === 'confirmed' ? 'approved' : status

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <PawPrint className="w-8 h-8 text-primary-500" />
              <span className="font-heading font-bold text-xl">
                <span className="text-dark">bow</span>
                <span className="text-primary-500">paw</span>
              </span>
              <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                {currentUser.role === 'owner' ? 'Owner' : 'Admin'}
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Account Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <UserCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showAccountSwitcher && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-medium">Switch Account</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {users.map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              switchAccount(user.id)
                              setShowAccountSwitcher(false)
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                              currentUser.id === user.id ? 'bg-primary-50' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              user.role === 'admin' ? 'bg-red-500' :
                              user.role === 'owner' ? 'bg-purple-500' : 'bg-primary-500'
                            }`}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              user.role === 'admin' ? 'bg-red-100 text-red-600' :
                              user.role === 'owner' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout */}
              <button
                onClick={() => fetchAdminData()}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className="relative flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open order notifications"
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Notifications</span>
                {openNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {openNotifications}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'carts', label: 'User Carts', icon: ShoppingCart },
            { id: 'users', label: 'Users', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'green' },
                { label: 'Total Orders', value: totalOrders, icon: Package, color: 'blue' },
                { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'yellow' },
                { label: 'Active Users', value: activeUsers, icon: Users, color: 'purple' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                  <p className="text-2xl font-bold text-dark">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg">Recent Orders</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-primary-500">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.userName}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {displayStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-primary-500">{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{order.userName}</p>
                          <p className="text-xs text-gray-500">{order.userEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} items</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Approved</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-primary-500 hover:text-primary-600"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
              {selectedOrder && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedOrder(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="font-heading font-bold text-xl">Order {selectedOrder.id}</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                        <p className="text-sm text-gray-600">{selectedOrder.userName}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.userEmail}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.userPhone}</p>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.shippingAddress.addressLine1}<br />
                          {selectedOrder.shippingAddress.addressLine2 && <>{selectedOrder.shippingAddress.addressLine2}<br /></>}
                          {selectedOrder.shippingAddress.area}, {selectedOrder.shippingAddress.city}<br />
                          {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}<br />
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.productName}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span>{selectedOrder.shipping === 0 ? 'Free' : formatPrice(selectedOrder.shipping)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax</span>
                          <span>{formatPrice(selectedOrder.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary-500">{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* User Carts Tab */}
        {activeTab === 'carts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {userCarts.map((cart, i) => (
              <motion.div
                key={cart.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {cart.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cart.userName}</p>
                      <p className="text-xs text-gray-500">{cart.userEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {cart.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cart Total</span>
                  <span className="font-bold text-primary-500">{formatPrice(cart.total)}</span>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date(cart.updatedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}

            {userCarts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No user carts found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            user.role === 'admin' ? 'bg-red-500' :
                            user.role === 'owner' ? 'bg-purple-500' : 'bg-primary-500'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.mobile || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-600' :
                          user.role === 'owner' ? 'bg-purple-100 text-purple-600' :
                          user.role === 'user' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
