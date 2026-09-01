"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroCarousel() {
  return (
    <section className="relative w-full min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background py-16 md:py-24">
      <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-10">
        <div className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-widest">
          SDGs 7, 8, 9 & 11
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter max-w-5xl text-foreground leading-[1.05]">
          Platform Ekonomi Sirkular <br />
          <span className="text-muted-foreground">Pintar & Berkelanjutan.</span>
        </h1>
        
        <p className="mx-auto max-w-[650px] text-lg md:text-xl text-muted-foreground leading-relaxed">
          Ekosistem digital end-to-end yang menghubungkan rumah tangga, titik drop-off, dan industri daur ulang B2B.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-6">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base font-medium h-14 px-8 rounded-md transition-all">
              Mulai Berkontribusi <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-base font-medium h-14 px-8 rounded-md border border-border bg-transparent text-foreground hover:bg-muted transition-all">
              Pelajari Sistem Kami
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
