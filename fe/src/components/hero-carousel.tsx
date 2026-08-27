"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80", // Sustainability hands
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80", // Forest nature
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80", // Leaves
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[calc(100vh-6rem)] flex items-center justify-center overflow-hidden py-16 md:py-24">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src}
              alt={`Hero Background ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Glassmorphism Overlay - Changed to be more transparent so images are visible */}
      <div className="absolute inset-0 z-0 bg-white/30 dark:bg-black/50 backdrop-blur-md"></div>
      
      <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-10">
        <div className="inline-flex items-center rounded-full border border-primary/40 bg-white/60 dark:bg-black/40 px-4 py-2 text-sm font-bold text-primary dark:text-primary shadow-lg backdrop-blur-xl uppercase tracking-wider">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary mr-3 animate-pulse"></span>
          SDGs 7, 8, 9 & 11
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter max-w-5xl text-slate-900 dark:text-white leading-[1.1] drop-shadow-lg">
          Platform Ekonomi Sirkular <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-secondary">Pintar & Berkelanjutan</span>
        </h1>
        
        <p className="mx-auto max-w-[800px] text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed drop-shadow-md">
          Ekosistem digital end-to-end yang menghubungkan rumah tangga, titik drop-off (RT/RW), dan industri daur ulang B2B. Ubah sampah menjadi nilai ekonomi.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto pt-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white gap-3 shadow-xl shadow-primary/30 text-lg font-bold h-16 px-10 rounded-full transition-transform hover:-translate-y-1 border-2 border-transparent">
              Mulai Berkontribusi <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-lg font-bold h-16 px-10 rounded-full border-2 border-slate-300 dark:border-white/20 bg-white/60 dark:bg-black/40 text-slate-900 dark:text-white backdrop-blur-xl hover:bg-white/80 dark:hover:bg-black/60 shadow-xl transition-transform hover:-translate-y-1">
              Pelajari Sistem Kami
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
