"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center lg:grid lg:grid-cols-2 bg-background">
      
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Beranda
      </Link>

      {/* Left Panel for Desktop */}
      <div className="hidden lg:flex flex-col justify-between p-12 h-full bg-zinc-950 text-white">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">
            EcoHub.
          </h1>
        </div>
        <div className="max-w-md">
          <p className="text-lg text-zinc-400 leading-relaxed">
            Platform Ekonomi Sirkular Pintar & Berkelanjutan. Mari ubah sampah menjadi manfaat untuk masa depan yang lebih hijau.
          </p>
        </div>
      </div>

      {/* Right Panel: Form area */}
      <div className="w-full h-full flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[28rem]">
          {children}
        </div>
      </div>
    </div>
  );
}
