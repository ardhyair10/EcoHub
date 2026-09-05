"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroCarousel() {
  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col items-center justify-start overflow-hidden bg-background pt-32 pb-16">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Aurora Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-normal z-0 pointer-events-none"></div>
      <div className="absolute top-[10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-normal z-0 pointer-events-none"></div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl text-foreground leading-[1.1] drop-shadow-sm">
          Platform Ekonomi Sirkular <br />
          <span className="text-muted-foreground">Pintar & Berkelanjutan.</span>
        </h1>
        
        <p className="mx-auto max-w-[650px] text-lg md:text-xl text-muted-foreground leading-relaxed">
          Ekosistem digital end-to-end yang menghubungkan rumah tangga, titik drop-off, dan industri daur ulang B2B.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4 mb-16">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base font-semibold h-12 px-8 rounded-full transition-transform hover:scale-[0.98]">
              Mulai Berkontribusi <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-base font-semibold h-12 px-8 rounded-full border-border bg-transparent text-foreground hover:bg-muted/50 transition-transform hover:scale-[0.98]">
              Pelajari Sistem Kami
            </Button>
          </Link>
        </div>

        {/* Hero Mockup Image */}
        <div className="w-full max-w-5xl mx-auto relative pt-8">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full w-full"></div>
          <Image 
            src="/images/hero-volunteer.jpg" 
            alt="Eco Hub Volunteers Cleaning Up Mockup" 
            width={1200} 
            height={675} 
            className="w-full rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10"
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
            priority
          />
        </div>
      </div>
    </section>
  );
}
