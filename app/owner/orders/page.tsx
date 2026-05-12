"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Fish,
  Home,
  LogOut,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, type Order } from "@/store/useAuthStore";
import { isAdminEmail } from "@/lib/authConfig";

const statusConfig: Record<Order["status"], { color: string; icon: any; bgColor: string }> = {
  pending: { color: "text-gray-700", icon: Clock, bgColor: "bg-gray-100" },
  confirmed: { color: "text-cyan-700", icon: CheckCircle, bgColor: "bg-cyan-100" },
  processing: { color: "text-yellow-700", icon: Package, bgColor: "bg-yellow-100" },
  shipped: { color: "text-blue-700", icon: Truck, bgColor: "bg-blue-100" },
  delivered: { color: "text-green-700", icon: CheckCircle, bgColor: "bg-green-100" },
  cancelled: { color: "text-red-700", icon: XCircle, bgColor: "bg-red-100" },
};

const displayStatus = (status: string) =>
  status === "confirmed" ? "Approved" : status.charAt(0).toUpperCase() + status.slice(1);
const formatDate = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const formatTime = (value: string) => new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const formatAddress = (order: Order) =>
  [
    order.shippingAddress.addressLine1,
    order.shippingAddress.area,
    order.shippingAddress.city,
    order.shippingAddress.district,
    order.shippingAddress.pincode,
  ]
    .filter(Boolean)
    .join(", ");

export default function OrdersPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | Order["status"]>("all");
  const [expandedStatus, setExpandedStatus] = useState<Order["status"] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { currentUser, logout, getAllOrders, updateOrderStatus, fetchAdminData } = useAuthStore();

  useEffect(() => {
    fetchAdminData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentUser || currentUser.role !== "owner" || !isAdminEmail(currentUser.email)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500"
        />
      </div>
    );
  }

  const orders = getAllOrders();
  const filteredOrders = orders.filter((order) => {
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !search ||
      order.id.toLowerCase().includes(search) ||
      order.userName.toLowerCase().includes(search) ||
      order.userPhone.toLowerCase().includes(search);
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleLogout = async () => {
    await logout();
    router.push("/owner/login");
  };

  const saveStatus = async (orderId: string, status: Order["status"]) => {
    await updateOrderStatus(orderId, status);
    setSelectedOrder(null);
  };

  const toggleStatusCard = (status: Order["status"]) => {
    setExpandedStatus((current) => current === status ? null : status);
    setSelectedStatus(status);
  };

  const expandedOrders = expandedStatus
    ? orders.filter((order) => order.status === expandedStatus)
    : [];

  const renderNextAction = (order: Order) => {
    if (order.status === "pending") {
      return <Button size="sm" onClick={() => saveStatus(order.id, "confirmed")} className="bg-cyan-600 hover:bg-cyan-700">Approve</Button>;
    }
    if (order.status === "confirmed") {
      return <Button size="sm" onClick={() => saveStatus(order.id, "processing")} className="bg-yellow-500 hover:bg-yellow-600">Mark Processing</Button>;
    }
    if (order.status === "processing") {
      return <Button size="sm" onClick={() => saveStatus(order.id, "shipped")} className="bg-blue-500 hover:bg-blue-600">Mark Shipped</Button>;
    }
    if (order.status === "shipped") {
      return <Button size="sm" onClick={() => saveStatus(order.id, "delivered")} className="bg-green-500 hover:bg-green-600">Mark Delivered</Button>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-2">
              <Fish className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Rainbow Aqua</h1>
              <p className="text-xs text-white/50">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/50 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link href="/owner/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/70 hover:bg-white/5 hover:text-white"><Home className="h-5 w-5" />Dashboard</Link>
            <Link href="/owner/products" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/70 hover:bg-white/5 hover:text-white"><Package className="h-5 w-5" />Products</Link>
            <Link href="/owner/orders" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-white">
              <ShoppingCart className="h-5 w-5" />
              Orders
              <Badge className="ml-auto bg-red-500 text-xs text-white">{orders.filter((order) => order.status === "pending").length}</Badge>
            </Link>
            <Link href="/owner/customers" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/70 hover:bg-white/5 hover:text-white"><Users className="h-5 w-5" />Customers</Link>
            <Link href="/owner/reports" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/70 hover:bg-white/5 hover:text-white"><BarChart3 className="h-5 w-5" />Reports</Link>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link href="/owner/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white"><Settings className="h-5 w-5" />Settings</Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 hover:bg-red-500/10"><LogOut className="h-5 w-5" />Logout</button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-40 border-b bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="h-6 w-6" /></button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Orders</h1>
                <p className="text-sm text-gray-500">Manage customer orders from Firestore</p>
              </div>
            </div>
            <Button variant="outline" size="icon"><Bell className="h-5 w-5" /></Button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(["pending", "confirmed", "processing", "shipped"] as Order["status"][]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatusCard(status)}
                aria-expanded={expandedStatus === status}
                className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  expandedStatus === status ? "border-cyan-500 ring-2 ring-cyan-100" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{displayStatus(status)}</span>
                  <span className={`h-2 w-2 rounded-full ${statusConfig[status].bgColor}`} />
                </div>
                <p className="mt-1 text-2xl font-bold text-gray-800">{orders.filter((order) => order.status === status).length}</p>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {expandedStatus && (
              <motion.div
                key={expandedStatus}
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-6 overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 border-b bg-gray-50 px-4 py-3">
                  <div>
                    <h2 className="font-semibold text-gray-800">{displayStatus(expandedStatus)} Orders</h2>
                    <p className="text-sm text-gray-500">{expandedOrders.length} order{expandedOrders.length === 1 ? "" : "s"} in this status</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setExpandedStatus(null)}>
                    Close
                  </Button>
                </div>

                <div className="divide-y">
                  {expandedOrders.slice(0, 6).map((order) => (
                    <div key={order.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">{order.userName}</p>
                        <p className="truncate text-xs text-gray-500">{order.id} - Rs. {order.total.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {renderNextAction(order)}
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>View</Button>
                      </div>
                    </div>
                  ))}

                  {expandedOrders.length === 0 && (
                    <p className="px-4 py-8 text-center text-sm text-gray-400">No {displayStatus(expandedStatus).toLowerCase()} orders.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search by order, customer, or phone" className="pl-10" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
              </div>
              <select className="rounded-lg border px-4 py-2 text-sm" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as "all" | Order["status"])}>
                <option value="all">All Status</option>
                {Object.keys(statusConfig).map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="hidden px-4 py-3 text-left md:table-cell">Location</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="hidden px-4 py-3 text-left sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{order.userName}</p>
                          <p className="text-xs text-gray-500">{order.userPhone}</p>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-600 md:table-cell">{formatAddress(order)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">Rs. {order.total.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {displayStatus(order.status)}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-500 sm:table-cell">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {order.status === "pending" && (
                              <Button size="sm" onClick={() => saveStatus(order.id, "confirmed")} className="bg-cyan-600 hover:bg-cyan-700">
                                Approve
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>View</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No orders found in Firestore.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold text-gray-800">{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-800">Customer Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><Users className="h-4 w-4" />{selectedOrder.userName}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{selectedOrder.userPhone}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{formatAddress(selectedOrder)}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-800">Products</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={`${item.productId}-${item.variant ?? "default"}`} className="flex items-center justify-between border-b py-2">
                      <div>
                        <p className="text-sm text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-800">Rs. {(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <p className="font-semibold text-gray-800">Total</p>
                    <p className="text-lg font-bold text-gray-800">Rs. {selectedOrder.total.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === "pending" && <Button size="sm" onClick={() => saveStatus(selectedOrder.id, "confirmed")} className="bg-cyan-600 hover:bg-cyan-700">Approve Order</Button>}
                    {selectedOrder.status === "confirmed" && <Button size="sm" onClick={() => saveStatus(selectedOrder.id, "processing")} className="bg-yellow-500 hover:bg-yellow-600">Mark Processing</Button>}
                    {selectedOrder.status === "processing" && <Button size="sm" onClick={() => saveStatus(selectedOrder.id, "shipped")} className="bg-blue-500 hover:bg-blue-600">Mark Shipped</Button>}
                    {selectedOrder.status === "shipped" && <Button size="sm" onClick={() => saveStatus(selectedOrder.id, "delivered")} className="bg-green-500 hover:bg-green-600">Mark Delivered</Button>}
                    <Button size="sm" variant="outline" onClick={() => saveStatus(selectedOrder.id, "cancelled")} className="border-red-500 text-red-500 hover:bg-red-50">Cancel Order</Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
