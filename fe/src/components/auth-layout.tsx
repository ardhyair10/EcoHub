"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Leaf } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const containerRef = useRef(null);
  
  useGSAP(() => {
    // Cinematic Reveal for Auth
    const tl = gsap.timeline();
    
    // Left side image zoom out slightly
    tl.from(".auth-bg-image", {
      scale: 1.1,
      duration: 2.5,
      ease: "power2.out"
    }, 0);
    
    // Left side text fade in
    tl.from(".auth-left-text > *", {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out"
    }, 0.3);
    
    // Right side form pop up
    tl.from(".auth-right-panel", {
      x: 30,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, 0.5);
    
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center lg:grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Beranda
      </Link>

      {/* Left Panel for Desktop with Image Background */}
      <div className="hidden lg:flex flex-col justify-between p-16 h-full relative z-10 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-volunteer.jpg" 
            alt="EcoHub Volunteer Illustration" 
            fill 
            className="auth-bg-image object-cover object-center"
            priority
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent"></div>
          <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply"></div>
        </div>

        {/* Content over Image */}
        <div className="auth-left-text relative z-10 text-white mt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/10">
              <Leaf className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-white drop-shadow-sm">
              Eco<span className="text-emerald-400">Hub</span>
            </h1>
          </div>
          <h2 className="text-5xl font-heading font-bold tracking-tight mb-4 text-white leading-[1.1] drop-shadow-md">
            Kelola daur ulang,<br/>selamatkan bumi.
          </h2>
          <p className="text-xl text-emerald-50/90 leading-relaxed max-w-md font-medium drop-shadow-sm">
            Platform Ekonomi Sirkular Pintar & Berkelanjutan. Mari ubah sampah menjadi manfaat untuk masa depan yang lebih hijau.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-emerald-100/70">
          <span>&copy; {new Date().getFullYear()} EcoHub. All rights reserved.</span>
        </div>
      </div>

      {/* Right Panel with Glassmorphism Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 h-full w-full relative z-10">
        <div className="auth-right-panel w-full max-w-[420px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-xl border border-white/40 dark:border-slate-800/60 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-800/40 dark:to-slate-900/10 rounded-[32px] pointer-events-none"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
