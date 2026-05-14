"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Fish, Package, ShoppingCart, Users, ArrowLeft, Upload, X,
  Plus, Settings, LogOut, BarChart3, Home, Menu, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { isAdminEmail } from "@/lib/authConfig";
import { addProductToDB, createSlug, uploadProductImage } from "@/lib/firebaseService";

const categories = [
  { id: "fish", name: "Fish", subcategories: ["Betta", "Goldfish", "Guppy", "Discus", "Angelfish", "Tetra", "Molly"] },
  { id: "birds", name: "Birds", subcategories: ["Budgerigar", "Cockatiel", "Lovebird", "Finch", "Parrot", "Canary"] },
  { id: "dogs", name: "Dogs", subcategories: ["Labrador", "German Shepherd", "Golden Retriever", "Poodle", "Beagle", "Bulldog", "Pug"] },
  { id: "cats", name: "Cats", subcategories: ["Persian", "Siamese", "Maine Coon", "Bengal", "Ragdoll", "British Shorthair", "Sphynx"] },
  { id: "accessories", name: "Accessories", subcategories: ["Aquarium", "Filter", "Heater", "Light", "Food", "Decor"] },
];

export default function AddProductPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "", description: "", category: "", subcategory: "",
    price: "", originalPrice: "", stock: "", sku: "",
    isNew: true, isFeatured: false, variants: [] as string[],
    weightValue: "", weightUnit: "g" as "g" | "kg",
  });
  const [newVariant, setNewVariant] = useState("");

  const isFoodProduct = formData.subcategory === "Food";

  if (!currentUser || currentUser.role !== "owner" || !isAdminEmail(currentUser.email)) return null;

  const currentCategory = categories.find(c => c.id === formData.category);

  const handleLogout = async () => { await logout(); router.push("/"); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      setImageFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImages(prev => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (newVariant.trim()) {
      setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant.trim()] }));
      setNewVariant("");
    }
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload images — if CORS not configured yet, skip images and save product anyway
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        try {
          uploadedUrls = await Promise.all(
            imageFiles.map(file => uploadProductImage(file, formData.name))
          );
        } catch {
          toast({ title: "Image upload failed", description: "Product will be saved without images. Fix Storage CORS to enable uploads.", variant: "destructive" });
        }
      }

      await addProductToDB({
        name: formData.name,
        slug: createSlug(formData.name),
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        sku: formData.sku,
        images: uploadedUrls,
        isNew: formData.isNew,
        isFeatured: formData.isFeatured,
        variants: formData.variants,
        inStock: Number(formData.stock) > 0,
        ...(isFoodProduct && formData.weightValue
          ? { weightValue: Number(formData.weightValue), weightUnit: formData.weightUnit }
          : {}),
      });

      toast({ title: "Product Added! ✅", description: `${formData.name} has been saved to database.` });
      router.push("/owner/products");
    } catch (err: any) {
      toast({ title: "Failed to save", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
            <Link href="/owner/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"><Home className="w-5 h-5" /><span>Dashboard</span></Link>
            <Link href="/owner/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white"><Package className="w-5 h-5" /><span>Products</span></Link>
            <Link href="/owner/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"><ShoppingCart className="w-5 h-5" /><span>Orders</span></Link>
            <Link href="/owner/customers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"><Users className="w-5 h-5" /><span>Customers</span></Link>
            <Link href="/owner/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"><BarChart3 className="w-5 h-5" /><span>Reports</span></Link>
          </nav>
          <div className="p-4 border-t border-white/10">
            <Link href="/owner/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"><Settings className="w-5 h-5" /><span>Settings</span></Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-5 h-5" /><span>Logout</span></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-40 bg-white border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="w-6 h-6" /></button>
              <Link href="/owner/products" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Back to Products</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Add New Product</h1>
            <div className="w-24" />
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" placeholder="e.g. Betta Fish - Halfmoon Blue" className="mt-1.5"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea id="description" placeholder="Describe your product..."
                        className="w-full mt-1.5 px-3 py-2 border rounded-lg text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <select id="category" className="w-full mt-1.5 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })} required>
                          <option value="">Select Category</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <select id="subcategory" className="w-full mt-1.5 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          value={formData.subcategory}
                          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value, weightValue: "", weightUnit: "g" })}
                          disabled={!formData.category}>
                          <option value="">Select Subcategory</option>
                          {currentCategory?.subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Product Images</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Upload</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Pricing & Stock</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Selling Price (₹) *</Label>
                      <Input id="price" type="number" placeholder="0.00" className="mt-1.5"
                        value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input id="originalPrice" type="number" placeholder="0.00" className="mt-1.5"
                        value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input id="stock" type="number" placeholder="0" className="mt-1.5"
                        value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" placeholder="e.g. FISH-BETTA-001" className="mt-1.5"
                        value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                    </div>
                    {isFoodProduct && (
                      <div className="sm:col-span-2">
                        <Label htmlFor="weightValue">Weight / Quantity</Label>
                        <div className="flex gap-2 mt-1.5">
                          <Input
                            id="weightValue"
                            type="number"
                            placeholder="e.g. 500"
                            className="flex-1"
                            value={formData.weightValue}
                            onChange={(e) => setFormData({ ...formData, weightValue: e.target.value })}
                            required={isFoodProduct}
                          />
                          <select
                            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-24"
                            value={formData.weightUnit}
                            onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value as "g" | "kg" })}
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Enter the net weight of the food product</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Variants */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Variants (Colors/Sizes)</h2>
                  <div className="flex gap-2 mb-3">
                    <Input placeholder="e.g. Blue, Red, Large" value={newVariant} onChange={(e) => setNewVariant(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVariant())} />
                    <Button type="button" onClick={addVariant} variant="outline"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.variants.map((variant, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                        {variant}
                        <button type="button" onClick={() => removeVariant(index)} className="ml-2"><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                    {formData.variants.length === 0 && <p className="text-sm text-gray-400">No variants added</p>}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Product Status</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500" />
                      <span className="text-sm text-gray-700">Mark as New Arrival</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500" />
                      <span className="text-sm text-gray-700">Featured Product</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 mb-3" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2"><Save className="w-4 h-4" />Save Product</span>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
                </div>

                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <h3 className="font-medium text-cyan-800 text-sm mb-2">💡 Tips</h3>
                  <ul className="text-xs text-cyan-700 space-y-1">
                    <li>• Use clear, high-quality images</li>
                    <li>• Write detailed descriptions</li>
                    <li>• Set competitive pricing</li>
                    <li>• Keep stock updated</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
