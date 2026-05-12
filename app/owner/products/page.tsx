"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Fish,
  Package,
  ShoppingCart,
  Users,
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
  Filter,
  MoreVertical,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { isAdminEmail } from "@/lib/authConfig";
import { deleteProductFromDB, type DBProduct } from "@/lib/firebaseService";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const statusColors: Record<string, string> = {
  "Active": "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

export default function ProductsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, getAllOrders, fetchAdminData } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'owner' && isAdminEmail(currentUser.email)) {
      fetchAdminData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner' || !isAdminEmail(currentUser.email)) {
      setLoading(false);
      return;
    }

    // Real-time listener — updates instantly when stock changes after orders
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id } as DBProduct))
          .sort((a, b) => a.name.localeCompare(b.name));
        setProducts(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentUser || currentUser.role !== 'owner' || !isAdminEmail(currentUser.email)) return null;

  const pendingOrders = getAllOrders().filter((order) => order.status === "pending" || order.status === "processing").length;

  const handleLogout = async () => { await logout(); router.push('/'); };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProductFromDB(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("Unable to delete product:", err?.code ?? err?.message ?? err);
    }
  };

  const getStatus = (p: DBProduct) => {
    if (!p.inStock || p.stock === 0) return "Out of Stock";
    if (p.stock <= 5) return "Low Stock";
    return "Active";
  };

  const filteredProducts = products.filter(p => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      p.name.toLowerCase().includes(normalizedSearch) ||
      p.category.toLowerCase().includes(normalizedSearch) ||
      p.subcategory.toLowerCase().includes(normalizedSearch) ||
      (p.sku ?? "").toLowerCase().includes(normalizedSearch);
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || getStatus(p) === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
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

          <nav className="flex-1 p-4 space-y-1">
            <Link href="/owner/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/owner/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white">
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
                <h1 className="text-xl font-bold text-gray-800">Products</h1>
                <p className="text-sm text-gray-500">Manage your inventory</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <Bell className="w-5 h-5" />
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
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select 
                  className="px-4 py-2 border rounded-lg text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="fish">Fish</option>
                  <option value="birds">Birds</option>
                  <option value="accessories">Accessories</option>
                </select>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  aria-controls="product-filters-panel"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {filtersOpen && (
              <div id="product-filters-panel" className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Stock Status</label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedStatus("All");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                        Product <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{product.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">₹{product.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.stock}
                        {product.subcategory === 'Food' && product.weightValue
                          ? <span className="ml-1 text-xs text-gray-400">({product.weightValue}{product.weightUnit})</span>
                          : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[getStatus(product)]}`}>
                          {getStatus(product)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/owner/products/edit?id=${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No products found. Add your first product.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">Showing {filteredProducts.length} of {products.length} products</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
