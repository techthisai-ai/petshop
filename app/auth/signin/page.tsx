"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Fish, ArrowRight, Truck, Shield, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { isAdminEmail } from "@/lib/authConfig";

function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const loginWithPassword = useAuthStore((state) => state.loginWithPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginWithPassword(formData.email.trim(), formData.password);

      if (!result.success) {
        toast({ title: "Sign in failed", description: result.message, variant: "destructive" });
        return;
      }

      const currentUser = useAuthStore.getState().currentUser;

      if (currentUser?.role === "owner" && isAdminEmail(currentUser.email)) {
        router.push("/owner/dashboard");
        return;
      }

      toast({ title: "Welcome back! 👋", description: "You have successfully signed in." });
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading("google");
    try {
      toast({ title: "Google sign-in not configured", description: "Please use a registered email/mobile and password." });
    } finally {
      setSocialLoading(null);
    }
  };

  const features = [
    { icon: Truck, text: "Track your orders", color: "text-orange-500" },
    { icon: Heart, text: "Manage wishlist", color: "text-red-500" },
    { icon: Shield, text: "Secure checkout", color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 relative overflow-hidden flex items-center">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600" />
      <div className="absolute top-20 left-10 text-8xl opacity-5 hidden lg:block">🛕</div>
      <div className="absolute bottom-20 right-10 text-8xl opacity-5 hidden lg:block">🐟</div>
      <div className="absolute top-1/3 right-20 text-6xl opacity-5 hidden lg:block">🦜</div>
      <div className="absolute bottom-1/3 left-20 text-6xl opacity-5 hidden lg:block">🌊</div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Side */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="hidden lg:block">
              <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-green-600 p-2 rounded-full">
                  <Fish className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-gray-800">Rainbow Aqua</h1>
                  <p className="text-xs text-gray-500">Premium Fish & Pets</p>
                </div>
              </Link>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Welcome Back to <span className="text-orange-500">Rainbow Aqua</span>
              </h2>
              <p className="text-gray-600 mb-8">Sign in to access your account, track orders, and continue shopping for premium fish and pets across Tamil Nadu.</p>
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                    <div className={`p-2 rounded-full bg-gray-50 ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-orange-100 to-green-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚚</span>
                  <div>
                    <p className="font-semibold text-gray-800">Free Delivery Above ₹2000</p>
                    <p className="text-sm text-gray-600">Across all Tamil Nadu districts</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-green-600 p-2 rounded-full">
                    <Fish className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-display text-xl font-bold">Rainbow Aqua</span>
                </div>

                <div className="text-center mb-6">
                  <Badge className="mb-2 bg-gradient-to-r from-orange-500 to-green-600 text-white">WELCOME BACK</Badge>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Sign In</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className="text-orange-500 hover:underline font-medium">Register</Link>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email or Mobile Number</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="email" type="text" placeholder="Enter your email or mobile number" className="pl-10"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Link href="/auth/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot Password?</Link>
                    </div>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10"
                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })} className="rounded border-gray-300" />
                    <label htmlFor="remember" className="text-sm text-gray-600">Remember me for 30 days</label>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white py-3">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Signing In...
                      </span>
                    ) : (<>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>)}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || socialLoading !== null}>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {socialLoading === "google" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connecting...</> : "Google"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full"
                    onClick={() => toast({ title: "Facebook sign-in not ready", description: "Use Google or email sign-in for now." })}>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-center text-sm text-gray-500">
                    Need help?{" "}<Link href="/contact" className="text-orange-500 hover:underline">Contact Support</Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-600 via-white to-orange-500" />
    </div>
  );
}

export default function SignInPageWrapper() {
  return (
    <Suspense>
      <SignInPage />
    </Suspense>
  );
}
