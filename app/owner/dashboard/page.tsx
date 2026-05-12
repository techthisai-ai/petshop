"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Fish,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Menu,
  X,
  Home,
  Layers,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isAdminEmail } from "@/lib/authConfig";

// Sample data
const stats = [
  { label: "Total Sales", value: "₹2,45,890", change: "+12.5%", icon: DollarSign, color: "bg-green-500" },
  { label: "Total Orders", value: "1,234", change: "+8.2%", icon: ShoppingCart, color: "bg-blue-500" },
  { label: "Products", value: "156", change: "+5", icon: Package, color: "bg-purple-500" },
  { label: "Customers", value: "892", change: "+23", icon: Users, color: "bg-orange-500" },
];

const recentOrders = [
  { id: "ORD-001", customer: "Rajesh Kumar", product: "Betta Fish - Halfmoon", amount: "₹1,499", status: "Delivered", date: "Today" },
  { id: "ORD-002", customer: "Priya S.", product: "Goldfish - Oranda", amount: "₹899", status: "Shipped", date: "Today" },
  { id: "ORD-003", customer: "Mohammed Ali", product: "Budgerigar - Blue", amount: "₹2,499", status: "Processing", date: "Yesterday" },
  { id: "ORD-004", customer: "Lakshmi N.", product: "Aquarium Tank 50L", amount: "₹4,999", status: "Pending", date: "Yesterday" },
  { id: "ORD-005", customer: "Arun P.", product: "Guppy Fish Set", amount: "₹599", status: "Delivered", date: "2 days ago" },
];

const topProducts = [
  { name: "Betta Fish - Halfmoon", sales: 145, revenue: "₹2,17,355", stock: 23 },
  { name: "Goldfish - Oranda", sales: 98, revenue: "₹88,102", stock: 45 },
  { name: "Budgerigar - Blue", sales: 67, revenue: "₹1,67,433", stock: 12 },
  { name: "Guppy Fish Set", sales: 234, revenue: "₹1,40,166", stock: 89 },
  { name: "Aquarium Tank 50L", sales: 45, revenue: "₹2,24,955", stock: 8 },
];

const statusColors: Record<string, string> = {
  "Delivered": "bg-green-100 text-green-700",
  "Shipped": "bg-blue-100 text-blue-700",
  "Processing": "bg-yellow-100 text-yellow-700",
  "Pending": "bg-gray-100 text-gray-700",
};

export default function OwnerDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedStat, setExpandedStat] = useState<string | null>(null);
  const { currentUser, logout, getAllOrders, getAllUserCarts, users, fetchAdminData } = useAuthStore();

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Middleware handles redirect — safety net only
  if (!currentUser || currentUser.role !== 'owner' || !isAdminEmail(currentUser.email)) {
    return null;
  }

  const orders = getAllOrders();
  const userCarts = getAllUserCarts();

  // Real stats from Firestore
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const customerUsers = users.filter(u => u.role === 'user');
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const pendingOrderList = orders.filter(o => o.status === 'pending');
  const totalCustomers = customerUsers.length;

  const liveStats = [
    { id: "revenue", label: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: "", icon: DollarSign, color: "bg-green-500" },
    { id: "orders", label: "Total Orders", value: totalOrders.toString(), change: "", icon: ShoppingCart, color: "bg-blue-500" },
    { id: "pending", label: "Pending Orders", value: pendingOrders.toString(), change: "", icon: Package, color: "bg-purple-500" },
    { id: "customers", label: "Customers", value: totalCustomers.toString(), change: "", icon: Users, color: "bg-orange-500" },
  ];

  const activeStat = liveStats.find((stat) => stat.id === expandedStat);

  const toggleStat = (statId: string) => {
    setExpandedStat((current) => current === statId ? null : statId);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Rainbow Aqua</h1>
              <p className="text-xs text-white/50">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white/50">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/owner/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/owner/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white">
              <Package className="w-5 h-5" />
              <span>Products</span>
            </Link>
            <Link href="/owner/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white">
              <ShoppingCart className="w-5 h-5" />
              <span>Orders</span>
              {pendingOrders > 0 && (
                <Badge className="ml-auto bg-red-500 text-white text-xs">{pendingOrders}</Badge>
              )}
            </Link>
            <Link href="/owner/customers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white">
              <Users className="w-5 h-5" />
              <span>Customers</span>
            </Link>
            <Link href="/owner/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white">
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </Link>
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-white/10">
            <Link href="/owner/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 w-full">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, Admin!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingOrders}
                  </span>
                )}
              </Button>
              <Link href="/owner/products/add">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {liveStats.map((stat, index) => (
              <motion.button
                key={stat.label}
                type="button"
                onClick={() => toggleStat(stat.id)}
                aria-expanded={expandedStat === stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  expandedStat === stat.id ? 'border-cyan-500 ring-2 ring-cyan-100' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeStat && (
              <motion.div
                key={activeStat.id}
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mb-6 overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="border-b bg-gray-50 px-4 py-3 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-800">{activeStat.label}</h2>
                      <p className="text-sm text-gray-500">Detailed view</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedStat(null)}>
                      Close
                    </Button>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {activeStat.id === "revenue" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                        <span className="text-sm font-medium text-green-800">Paid revenue</span>
                        <span className="font-bold text-green-800">₹{totalRevenue.toLocaleString('en-IN')}</span>
                      </div>
                      {paidOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{order.userName}</p>
                            <p className="text-xs text-gray-500">{order.id.slice(0, 10)}</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      {paidOrders.length === 0 && <p className="text-sm text-gray-400">No paid orders yet.</p>}
                    </div>
                  )}

                  {activeStat.id === "orders" && (
                    <div className="space-y-3">
                      {orders.slice(0, 6).map((order) => (
                        <div key={order.id} className="flex flex-col gap-2 border-b py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{order.userName}</p>
                            <p className="text-xs text-gray-500">{order.id.slice(0, 10)} - {order.items.length} items</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-800">₹{order.total.toLocaleString('en-IN')}</span>
                            <Badge className="bg-gray-100 text-gray-700">{order.status === 'confirmed' ? 'approved' : order.status}</Badge>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-sm text-gray-400">No orders yet.</p>}
                    </div>
                  )}

                  {activeStat.id === "pending" && (
                    <div className="space-y-3">
                      {pendingOrderList.slice(0, 6).map((order) => (
                        <div key={order.id} className="flex flex-col gap-2 border-b py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{order.userName}</p>
                            <p className="text-xs text-gray-500">{order.userPhone || order.userEmail || order.id.slice(0, 10)}</p>
                          </div>
                          <Link href="/owner/orders" className="text-sm font-medium text-cyan-600 hover:underline">
                            Review order
                          </Link>
                        </div>
                      ))}
                      {pendingOrderList.length === 0 && <p className="text-sm text-gray-400">No pending orders.</p>}
                    </div>
                  )}

                  {activeStat.id === "customers" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {customerUsers.slice(0, 6).map((user) => (
                        <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">{user.name}</p>
                            <p className="truncate text-xs text-gray-500">{user.email || user.mobile || "No contact"}</p>
                          </div>
                        </div>
                      ))}
                      {customerUsers.length === 0 && <p className="text-sm text-gray-400">No customers yet.</p>}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders from Firestore */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
              <div className="p-4 sm:p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                <Link href="/owner/orders" className="text-sm text-cyan-600 hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Order ID</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{order.id.slice(0, 10)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.userName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No orders yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Customers from Firestore */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 sm:p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Customers</h2>
                <Link href="/owner/customers" className="text-sm text-cyan-600 hover:underline">View All</Link>
              </div>
              <div className="p-4 space-y-4">
                {users.filter(u => u.role === 'user').slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email || u.mobile}</p>
                    </div>
                  </div>
                ))}
                {users.filter(u => u.role === 'user').length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No customers yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/owner/products/add">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link href="/owner/orders">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <FileText className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
              </Link>
              <Link href="/" target="_blank">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Eye className="w-4 h-4 mr-2" />
                  View Store
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
