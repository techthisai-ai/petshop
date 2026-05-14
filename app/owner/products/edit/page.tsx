"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { isAdminEmail } from "@/lib/authConfig";
import { createSlug, getProductFromDB, updateProductInDB, type DBProduct } from "@/lib/firebaseService";

const categories = [
  { id: "fish", name: "Fish", subcategories: ["Betta", "Goldfish", "Guppy", "Discus", "Angelfish", "Tetra", "Molly"] },
  { id: "birds", name: "Birds", subcategories: ["Budgerigar", "Cockatiel", "Lovebird", "Finch", "Parrot", "Canary"] },
  { id: "dogs", name: "Dogs", subcategories: ["Labrador", "German Shepherd", "Golden Retriever", "Poodle", "Beagle", "Bulldog", "Pug"] },
  { id: "cats", name: "Cats", subcategories: ["Persian", "Siamese", "Maine Coon", "Bengal", "Ragdoll", "British Shorthair", "Sphynx"] },
  { id: "accessories", name: "Accessories", subcategories: ["Aquarium", "Filter", "Heater", "Light", "Food", "Decor"] },
];

function EditProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const currentUser = useAuthStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    isNew: false,
    isFeatured: false,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "owner" || !isAdminEmail(currentUser.email)) {
      setLoading(false);
      return;
    }

    if (!productId) {
      setLoading(false);
      return;
    }

    getProductFromDB(productId)
      .then((product) => {
        if (!product) return;
        setFormData({
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          price: String(product.price),
          originalPrice: product.originalPrice ? String(product.originalPrice) : "",
          stock: String(product.stock),
          sku: product.sku ?? "",
          isNew: product.isNew,
          isFeatured: product.isFeatured,
        });
      })
      .catch((err) => {
        toast({ title: "Unable to load product", description: err?.message ?? "Please try again.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [currentUser, productId]);

  if (!currentUser || currentUser.role !== "owner" || !isAdminEmail(currentUser.email)) return null;

  const currentCategory = categories.find((category) => category.id === formData.category);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!productId) {
      toast({ title: "Missing product", description: "No product ID was provided.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<DBProduct> = {
        name: formData.name.trim(),
        slug: createSlug(formData.name),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        sku: formData.sku.trim(),
        isNew: formData.isNew,
        isFeatured: formData.isFeatured,
        inStock: Number(formData.stock) > 0,
      };

      await updateProductInDB(productId, updates);
      toast({ title: "Product updated", description: `${updates.name} has been saved.` });
      router.push("/owner/products");
    } catch (err: any) {
      toast({ title: "Failed to update", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/owner/products" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-500">Update product details stored in Firestore.</p>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading product...
            </div>
          ) : !productId ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Product ID missing. Open this page from the Products table.
            </div>
          ) : (
            <form onSubmit={handleSave} className="mt-6 grid gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="mt-1.5 min-h-[120px] w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value, subcategory: "" })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <select
                    id="subcategory"
                    className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={formData.subcategory}
                    onChange={(event) => setFormData({ ...formData, subcategory: event.target.value })}
                    disabled={!formData.category}
                  >
                    <option value="">Select Subcategory</option>
                    {currentCategory?.subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">Selling Price</Label>
                  <Input id="price" type="number" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input id="originalPrice" type="number" value={formData.originalPrice} onChange={(event) => setFormData({ ...formData, originalPrice: event.target.value })} />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" value={formData.stock} onChange={(event) => setFormData({ ...formData, stock: event.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={formData.sku} onChange={(event) => setFormData({ ...formData, sku: event.target.value })} />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={formData.isNew} onChange={(event) => setFormData({ ...formData, isNew: event.target.checked })} />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(event) => setFormData({ ...formData, isFeatured: event.target.checked })} />
                  Featured Product
                </label>
              </div>

              <Button className="w-full sm:w-auto" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Product
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={null}>
      <EditProductContent />
    </Suspense>
  );
}
