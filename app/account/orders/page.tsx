"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

const statusClass: Record<string, string> = {
  delivered: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  pending: "bg-orange-100 text-orange-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const displayStatus = (status: string) => status === "confirmed" ? "approved" : status;

export default function AccountOrdersPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const orders = useAuthStore((state) => state.orders);
  const fetchMyOrders = useAuthStore((state) => state.fetchMyOrders);
  const myOrders = currentUser ? orders.filter((order) => order.userId === currentUser.id) : [];

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchMyOrders();
    }
  }, [isAuthenticated, currentUser?.id]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <section className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
              <p className="text-muted-foreground">Track recent purchases and delivery status.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/account">Back to Account</Link>
            </Button>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="font-semibold text-gray-800">Please sign in to view your orders.</p>
              <Button asChild className="mt-4 bg-primary">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          ) : myOrders.length > 0 ? (
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              {myOrders.map((order) => (
                <div key={order.id} className="flex flex-col gap-3 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{order.items[0]?.productName ?? "Order"}</p>
                    <p className="text-sm text-muted-foreground">{order.id} - {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="font-semibold">Rs. {order.total.toLocaleString("en-IN")}</p>
                    <Badge className={statusClass[order.status] ?? "bg-gray-100 text-gray-700"}>
                      {displayStatus(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="font-semibold text-gray-800">No orders yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                New accounts start with zero orders. Your purchases will show here.
              </p>
              <Button asChild className="mt-4 bg-primary">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
