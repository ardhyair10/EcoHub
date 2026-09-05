"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CheckoutSuccessPage() {
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    // Generate dummy order number
    setOrderNumber(`ECO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(".success-icon", {
      scale: 0,
      rotation: -180,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    });
    
    tl.from(".success-text > *", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.3");
    
    tl.from(".success-card", {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.2");
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="success-icon w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-8 border-emerald-500/20">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        
        <div className="success-text space-y-3">
          <h1 className="text-3xl font-heading font-black text-foreground">Pembayaran Berhasil!</h1>
          <p className="text-muted-foreground font-medium text-lg">
            Terima kasih telah berbelanja produk ramah lingkungan. Pesanan Anda sedang diproses.
          </p>
        </div>

        <div className="success-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <Package className="w-5 h-5" />
            <span className="font-bold">Detail Pesanan</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-muted-foreground">Nomor Pesanan</span>
              <span className="font-bold text-foreground">{orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-muted-foreground">Tanggal Pembelian</span>
              <span className="font-bold text-foreground">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-muted-foreground">Status</span>
              <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full text-xs">Diproses</span>
            </div>
          </div>
        </div>

        <div className="success-text flex flex-col gap-3 pt-4">
          <Link href="/dashboard">
            <Button className="w-full h-14 rounded-xl text-md font-bold shadow-lg shadow-primary/20">
              Lihat Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" className="w-full h-14 rounded-xl text-md font-bold">
              <Home className="mr-2 w-4 h-4" /> Kembali ke Katalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
