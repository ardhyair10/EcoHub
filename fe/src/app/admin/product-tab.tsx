import { useState, useEffect, useCallback } from "react";
import { Plus, Package, Edit, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeFetchJson } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  id: string;
  name: string;
  description: string;
  price_idr: number;
  max_point_discount: number;
  stock: number;
  is_active: boolean;
}

export default function ProductTab({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_idr: "",
    max_point_discount: "",
    stock: "",
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products?limit=50`);
      const data = await safeFetchJson(res);
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price_idr: parseInt(form.price_idr),
          max_point_discount: parseInt(form.max_point_discount) || 0,
          stock: parseInt(form.stock) || 0,
          image_url: form.image_url || undefined,
        })
      });
      const data = await safeFetchJson(res);
      if (data.success) {
        setShowForm(false);
        setForm({ name: "", description: "", price_idr: "", max_point_discount: "", stock: "", image_url: "" });
        fetchProducts();
      } else {
        alert(data.message || "Gagal menambahkan produk");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Kelola Produk (EcoCommerce)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Tambahkan reward atau barang ramah lingkungan.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Batal" : "Tambah Produk"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Tumbler Eco..." />
              </div>
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Penjelasan singkat..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <Input required type="number" value={form.price_idr} onChange={e => setForm({...form, price_idr: e.target.value})} placeholder="15000" />
              </div>
              <div className="space-y-2">
                <Label>Max Diskon Poin</Label>
                <Input required type="number" value={form.max_point_discount} onChange={e => setForm({...form, max_point_discount: e.target.value})} placeholder="5000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL Gambar (Opsional)</Label>
              <Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Produk"}
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-bold">Produk</th>
                  <th className="px-6 py-4 font-bold">Harga</th>
                  <th className="px-6 py-4 font-bold">Stok</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada produk.</td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p>Rp {p.price_idr.toLocaleString()}</p>
                        <p className="text-xs text-primary">Max diskon: {p.max_point_discount} Poin</p>
                      </td>
                      <td className="px-6 py-4 font-bold">{p.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {p.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleToggleActive(p.id, p.is_active)}
                        >
                          {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
