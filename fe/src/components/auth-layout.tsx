"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2000&auto=format&fit=crop", // Forest nature
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2000&auto=format&fit=crop", // Leaves
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop", // Sustainability hands
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center lg:grid lg:grid-cols-2 overflow-hidden bg-slate-950">
      
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 hover:text-white group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Beranda
      </Link>

      {/* Background Carousel for Mobile (hidden on desktop where it splits) / Left Panel for Desktop */}
      <div className="absolute inset-0 lg:relative lg:inset-auto lg:h-full w-full h-full overflow-hidden z-0">
        {CAROUSEL_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-black/50 lg:bg-black/30 z-10" /> {/* Dark overlay for readability */}
            <Image
              src={src}
              alt={`EcoHub Background ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        <div className="relative z-20 h-full hidden lg:flex flex-col items-start justify-end p-12 text-white">
          <h1 className="text-5xl font-heading font-bold mb-4 tracking-tight shadow-sm">
            Eco Hub.
          </h1>
          <p className="text-lg max-w-md text-white/90 font-medium">
            Platform Ekonomi Sirkular Pintar & Berkelanjutan. Mari ubah sampah menjadi manfaat untuk masa depan yang lebih hijau.
          </p>
        </div>
      </div>

      {/* Right Panel: Form area with Glassmorphism container support */}
      <div className="relative z-10 w-full max-w-md lg:max-w-none p-4 lg:p-12 lg:h-full flex items-center justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
