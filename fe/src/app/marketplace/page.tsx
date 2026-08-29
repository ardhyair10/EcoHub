"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, Search, TreePine, Droplets, Package, Leaf } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  price_idr?: number;
  stock: number;
  max_point_discount: number;
  image_url: string;
  category?: string;
  carbon_saved_kg: number;
  plastic_saved_kg: number;
  eco_badge_desc: string;
  impact_desc: string;
  seller?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/products?page=${page}&limit=12&search=${encodeURIComponent(search)}`, {
          headers
        });
        const data = await safeFetchJson(res);
        if (res.ok && data.success) {
          setProducts(data.data.products);
          setTotalPages(data.data.pagination?.totalPages || data.data.totalPages || 1);
        } else {
          setError(data.message || "Gagal memuat produk");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [page, search, API_URL]);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-inter">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Eco Marketplace</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 mb-8 text-center border border-white/20 dark:border-slate-800/50 backdrop-blur-sm">
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-4">Produk Ramah Lingkungan</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Temukan produk berkelanjutan dan gunakan Eco-Points Anda untuk mendapatkan diskon. Setiap pembelian membantu mengurangi jejak karbon dan sampah plastik.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Cari produk eco-friendly..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-12 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 mb-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}>
                <Card className="h-full overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Leaf className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    
                    {product.eco_badge_desc && (
                      <div className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        {product.eco_badge_desc}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5">
                    <div className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
                      Oleh {product.seller?.name || "Ricki Gilang Saputra"}
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">
                      {product.description}
                    </p>
                    
                    <div className="flex gap-3 mb-2">
                      {product.carbon_saved_kg > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-md">
                          <TreePine className="w-3.5 h-3.5" />
                          -{product.carbon_saved_kg} kg CO₂
                        </div>
                      )}
                      {product.plastic_saved_kg > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-1 rounded-md">
                          <Droplets className="w-3.5 h-3.5" />
                          -{product.plastic_saved_kg} kg
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="px-5 pb-5 pt-0 flex flex-col items-start gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-auto">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatIDR(product.price_idr || product.price || 0)}
                    </div>
                    {product.max_point_discount > 0 && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full w-full text-center">
                        Tukar poin s.d. {product.max_point_discount} pts
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-slate-900 dark:text-white mb-2">Tidak ada produk</h3>
            <p className="text-slate-500 dark:text-slate-400">Produk yang Anda cari tidak ditemukan.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="rounded-full"
            >
              Sebelumnya
            </Button>
            <div className="flex items-center px-4 font-medium text-slate-600 dark:text-slate-300">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="rounded-full"
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
