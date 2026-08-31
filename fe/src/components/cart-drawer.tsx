"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Trash2, Plus, Minus, Receipt } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { safeFetchJson } from "@/lib/api";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    updatePoints,
    totalItems, 
    totalPrice, 
    totalPointsUsed, 
    totalFinalPrice,
    clearCart
  } = useCart();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsCartOpen(false);
        router.push("/login");
        return;
      }

      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const payload = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          points_used: item.points_used
        }))
      };

      const res = await fetch(`${API}/api/orders/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await safeFetchJson(res);
      if (data.success) {
        clearCart();
        setIsCartOpen(false);
        alert(data.message || "Pesanan berhasil dibuat!");
        // Refresh router to update points in UI if needed
        router.refresh();
      } else {
        alert(data.message || "Gagal checkout");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0">
        <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Keranjang Belanja
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {totalItems} item
              </span>
            </SheetTitle>
            <SheetDescription>
              Tinjau dan proses pesanan ramah lingkungan Anda.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
              <ShoppingCart className="w-16 h-16 mb-4 stroke-[1.5]" />
              <p>Keranjang Anda masih kosong</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm truncate pr-2">{item.name}</h4>
                      <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-sm font-bold text-primary mb-2">
                      {formatRupiah(item.price_idr)}
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-950">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium px-2 py-1 min-w-[2rem] text-center border-x border-slate-200 dark:border-slate-700">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {item.points_used > 0 && (
                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                          -{item.points_used} Poin
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatRupiah(totalPrice)}</span>
              </div>
              {totalPointsUsed > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Diskon Poin</span>
                  <span className="font-medium">-{formatRupiah(totalPointsUsed)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="font-bold">Total Pembayaran</span>
                <span className="font-bold text-lg text-primary">{formatRupiah(totalFinalPrice)}</span>
              </div>
            </div>
            
            <SheetFooter>
              <Button 
                onClick={handleCheckout} 
                className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? "Memproses..." : (
                  <>
                    <Receipt className="w-5 h-5 mr-2" /> Checkout Sekarang
                  </>
                )}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
