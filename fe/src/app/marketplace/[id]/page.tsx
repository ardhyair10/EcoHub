"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, TreePine, Droplets, Minus, Plus, AlertCircle, CheckCircle2, Leaf } from "lucide-react";
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
  category: string;
  carbon_saved_kg: number;
  plastic_saved_kg: number;
  eco_badge_desc: string;
  impact_desc: string;
  seller?: {
    name: string;
  };
}

interface User {
  id: string;
  points: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState(1);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [orderStatus, setOrderStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Fetch product
        const prodRes = await fetch(`${API_URL}/api/products/${id}`, { headers });
        const prodData = await safeFetchJson(prodRes);
        
        if (!prodRes.ok || !prodData.success) {
          throw new Error(prodData.message || "Failed to fetch product");
        }
        setProduct(prodData.data);

        // Fetch user points if logged in
        if (token) {
          const userRes = await fetch(`${API_URL}/api/users/me`, { headers });
          const userData = await safeFetchJson(userRes);
          if (userData.success) {
            setUserPoints(userData.data.eco_points ?? userData.data.points ?? 0);
          }
        }
      } catch (err: any) {
        setError(err.message || "Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_URL]);

  const handleCheckout = async () => {
    if (!product) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsOrdering(true);
    setOrderStatus(null);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          points_used: pointsUsed
        })
      });
      
      const data = await safeFetchJson(res);
      
      if (data.success) {
        setOrderStatus({ type: 'success', message: 'Pesanan berhasil dibuat!' });
        setUserPoints(prev => Math.max(0, prev - pointsUsed));
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            u.eco_points = Math.max(0, (u.eco_points || 0) - pointsUsed);
            localStorage.setItem("user", JSON.stringify(u));
          } catch {}
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setOrderStatus({ type: 'error', message: data.message || 'Gagal membuat pesanan' });
      }
    } catch (err) {
      setOrderStatus({ type: 'error', message: 'Terjadi kesalahan jaringan' });
    } finally {
      setIsOrdering(false);
    }
  };

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center pt-20 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{error || "Produk tidak ditemukan"}</p>
        <Button onClick={() => router.push("/marketplace")}>Kembali ke Marketplace</Button>
      </div>
    );
  }

  const productPrice = product.price_idr || product.price || 0;
  const subtotal = productPrice * quantity;
  const maxAllowedPoints = Math.min(product.max_point_discount * quantity, userPoints, subtotal);
  // Ensure points used doesn't exceed allowed limits if quantity changes
  if (pointsUsed > maxAllowedPoints) {
    setPointsUsed(maxAllowedPoints);
  }
  const finalPrice = subtotal - pointsUsed;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-inter pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/marketplace")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">Detail Produk</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Image */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/50">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Leaf className="w-32 h-32 text-primary/40" />
                </div>
              )}
              
              {product.eco_badge_desc && (
                <div className="absolute top-4 left-4 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  {product.eco_badge_desc}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Info & Checkout */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">
                {product.name}
              </h1>
              <p className="text-primary font-semibold text-sm">
                Oleh {product.seller?.name || "Ricki Gilang Saputra"}
              </p>
            </div>

            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatIDR(productPrice)}
              <span className="text-lg text-slate-500 dark:text-slate-400 font-normal ml-2">/ item</span>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Eco Impact Section */}
            {(product.carbon_saved_kg > 0 || product.plastic_saved_kg > 0 || product.impact_desc) && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Dampak Lingkungan
                </h3>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  {product.carbon_saved_kg > 0 && (
                    <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 px-4 py-2 rounded-2xl border border-emerald-500/20">
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full">
                        <TreePine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Karbon Dicegah</div>
                        <div className="font-bold text-slate-900 dark:text-white">{product.carbon_saved_kg} kg</div>
                      </div>
                    </div>
                  )}
                  {product.plastic_saved_kg > 0 && (
                    <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 px-4 py-2 rounded-2xl border border-sky-500/20">
                      <div className="bg-sky-100 dark:bg-sky-900/50 p-2 rounded-full">
                        <Droplets className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Plastik Dicegah</div>
                        <div className="font-bold text-slate-900 dark:text-white">{product.plastic_saved_kg} kg</div>
                      </div>
                    </div>
                  )}
                </div>

                {product.impact_desc && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-primary pl-3">
                    "{product.impact_desc}"
                  </p>
                )}
              </div>
            )}

            {/* Checkout Card */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-white">Jumlah</span>
                  <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full" 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full" 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Eco Points */}
                {maxAllowedPoints > 0 && (
                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-900 dark:text-white">Gunakan Eco-Points</span>
                      <span className="text-sm text-accent bg-accent/10 px-2 py-1 rounded-md font-medium">
                        Saldo: {userPoints} Pts
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max={maxAllowedPoints}
                        value={pointsUsed}
                        onChange={(e) => setPointsUsed(parseInt(e.target.value))}
                        className="w-full accent-accent"
                      />
                      <span className="w-16 text-right font-bold text-accent">{pointsUsed}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                      Max diskon untuk {quantity} item: {product.max_point_discount * quantity} Pts
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal ({quantity} item)</span>
                    <span>{formatIDR(subtotal)}</span>
                  </div>
                  {pointsUsed > 0 && (
                    <div className="flex justify-between text-accent font-medium">
                      <span>Diskon Poin</span>
                      <span>-{formatIDR(pointsUsed)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <span>Total Bayar</span>
                    <span>{formatIDR(finalPrice)}</span>
                  </div>
                </div>

                {/* Order Status Message */}
                {orderStatus && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    orderStatus.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {orderStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{orderStatus.message}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                  onClick={handleCheckout}
                  disabled={isOrdering || product.stock < 1}
                >
                  {isOrdering ? 'Memproses...' : (product.stock < 1 ? 'Stok Habis' : 'Beli Sekarang')}
                </Button>

              </CardContent>
            </Card>
            
          </div>
        </div>
      </main>
    </div>
  );
}
