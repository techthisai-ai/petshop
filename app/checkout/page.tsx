"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  CreditCard,
  Truck,
  MapPin,
  Check,
  AlertCircle,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store";
import { useCartStore as useLegacyCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const steps = [
  { id: 1, name: "Shipping", icon: MapPin },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Review", icon: Check },
];

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const {
    items: legacyItems,
    getSubtotal: getLegacySubtotal,
    clearCart: clearLegacyCart,
  } = useLegacyCartStore();
  const { currentUser, createOrder } = useAuthStore();
  const router = useRouter();
  const cartItems = items.length > 0 ? items : legacyItems;
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToWaiver, setAgreedToWaiver] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = items.length > 0 ? getTotal() : getLegacySubtotal();
  const shipping = subtotal >= 2000 ? 0 : 199;
  const total = subtotal + shipping;

  const hasLiveFish = cartItems.some(
    (item) => item.product.category === "aquarium-fish"
  );

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasLiveFish && !agreedToWaiver) {
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const tax = Math.round(subtotal * 0.09);
      const orderTotal = subtotal + shipping + tax;

      const orderItems = cartItems.map((item) => ({
        productId: item.product.id ?? '',
        productName: item.product.name ?? '',
        productImage: item.product.images?.[0] ?? '',
        price: item.product.price ?? 0,
        quantity: item.quantity ?? 1,
        ...('selectedVariants' in item && item.selectedVariants && Object.keys(item.selectedVariants).length > 0
          ? { variant: Object.values(item.selectedVariants).join(', ') }
          : {}),
      }));

      await createOrder({
        userId: currentUser?.id ?? 'guest',
        userName: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim() || 'Customer',
        userEmail: shippingInfo.email || '',
        userPhone: shippingInfo.phone || '',
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total: orderTotal,
        status: 'pending',
        shippingAddress: {
          addressLine1: shippingInfo.address || '',
          area: shippingInfo.city || '',
          city: shippingInfo.city || '',
          district: shippingInfo.city || '',
          pincode: shippingInfo.pincode || '',
          state: 'Tamil Nadu',
          country: 'India',
        },
        paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'COD',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      });

      clearCart();
      clearLegacyCart();

      toast({
        title: 'Order Placed Successfully!',
        description: 'Your order is waiting for admin approval.',
      });

      router.push('/account/orders');
    } catch (err: any) {
      toast({
        title: 'Order failed',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Order Successful</h1>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <Navigation />

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      currentStep >= step.id
                        ? "bg-secondary text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    Shipping Information
                  </h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          required
                          value={shippingInfo.firstName}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          required
                          value={shippingInfo.lastName}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={shippingInfo.email}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        required
                        value={shippingInfo.address}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          required
                          value={shippingInfo.city}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          required
                          value={shippingInfo.state}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, state: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          required
                          value={shippingInfo.pincode}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, pincode: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Live Fish Waiver */}
                    {hasLiveFish && (
                      <div className="bg-coral/10 border border-coral/20 rounded-lg p-4 mt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-coral mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-coral">Live Fish Health Waiver</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your order contains live fish. By proceeding, you acknowledge:
                            </p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                              <li>Fish will be shipped overnight with express delivery</li>
                              <li>You must be available to receive the package</li>
                              <li>Acclimation instructions must be followed</li>
                              <li>DOA claims must be reported within 2 hours with photos</li>
                            </ul>
                            <div className="flex items-center space-x-2 mt-4">
                              <Checkbox
                                id="waiver"
                                checked={agreedToWaiver}
                                onCheckedChange={(checked) => setAgreedToWaiver(checked as boolean)}
                              />
                              <Label htmlFor="waiver" className="text-sm cursor-pointer">
                                I agree to the live fish shipping waiver
                              </Label>
                            </div>
                            {!agreedToWaiver && (
                              <p className="mt-2 text-xs text-coral">
                                Please agree to continue to payment.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/cart">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Cart
                        </Link>
                      </Button>
                      <Button
                        type="submit"
                        variant="ocean"
                        disabled={hasLiveFish && !agreedToWaiver}
                      >
                        {hasLiveFish && !agreedToWaiver ? "Agree to Waiver First" : "Continue to Payment"}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-secondary" />
                    Payment Method
                  </h2>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`w-full p-4 rounded-lg border flex items-center gap-4 ${
                          paymentMethod === "razorpay"
                            ? "border-secondary bg-secondary/10"
                            : "hover:border-muted-foreground"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "razorpay" ? "border-secondary" : ""
                        }`}>
                          {paymentMethod === "razorpay" && (
                            <div className="w-3 h-3 bg-secondary rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Pay with Razorpay</p>
                          <p className="text-sm text-muted-foreground">
                            Credit/Debit Card, UPI, Net Banking
                          </p>
                        </div>
                        <CreditCard className="w-6 h-6 text-secondary" />
                      </button>

                      {total < 50000 && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cod")}
                          className={`w-full p-4 rounded-lg border flex items-center gap-4 ${
                            paymentMethod === "cod"
                              ? "border-secondary bg-secondary/10"
                              : "hover:border-muted-foreground"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "cod" ? "border-secondary" : ""
                          }`}>
                            {paymentMethod === "cod" && (
                              <div className="w-3 h-3 bg-secondary rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              Pay when you receive your order
                            </p>
                          </div>
                          <Truck className="w-6 h-6 text-accent" />
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button type="submit" variant="ocean">
                        Review Order
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Check className="w-5 h-5 text-secondary" />
                    Review Your Order
                  </h2>

                  {/* Shipping Info */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                      <p className="font-medium">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                      <p>{shippingInfo.address}</p>
                      <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.pincode}</p>
                      <p>{shippingInfo.phone}</p>
                      <p>{shippingInfo.email}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                      <p>{paymentMethod === "razorpay" ? "Razorpay (Card/UPI/Net Banking)" : "Cash on Delivery"}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.product.id} className="flex gap-4 bg-muted/50 rounded-lg p-3">
                          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      variant="ocean"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Place Order • ${formatPrice(total)}`}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-card rounded-xl border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-xs text-primary rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-accent" : ""}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-secondary">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Secure checkout powered by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
