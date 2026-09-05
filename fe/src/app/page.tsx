"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, Recycle, MapPin, ArrowRight, TreePine, Wind, ShoppingCart, BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroCarousel } from "@/components/hero-carousel";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // ignore error
      }
    }
  }, []);

  useGSAP(() => {
    // 3D Floating Animation
    gsap.to(".float-3d-item", {
      y: -20,
      rotation: 3,
      duration: 3.5,
      stagger: {
        each: 0.2,
        from: "random",
      },
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Features Section Animation
    gsap.fromTo(".feature-card", 
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: "power3.out",
        clearProps: "all", // Penting: Hapus style GSAP setelah selesai biar hover CSS bisa jalan!
        scrollTrigger: {
          trigger: "#features",
          start: "top 75%",
        }
      }
    );

    // How It Works Animation
    gsap.from(".step-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#how-it-works",
        start: "top 75%",
      }
    });

    // Impact Cards Animation
    gsap.from(".impact-card", {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: "#impact",
        start: "top 75%",
      }
    });
  }, { scope: containerRef });

  return (
    <div className="flex flex-col min-h-screen" ref={containerRef}>
      {/* Navbar */}
      <header className="px-6 lg:px-14 h-24 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50  bg-card  sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Leaf className="h-7 w-7 text-primary" />
          </div>
          <span className="text-3xl font-heading font-extrabold tracking-tighter text-foreground ">
            Eco<span className="text-primary">Hub</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-base font-semibold text-foreground dark:text-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Fitur</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">Cara Kerja</Link>
          <Link href="#impact" className="hover:text-primary transition-colors">Dampak</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Setor Sampah</Link>
          <Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link href={user.role === "ADMIN_RW" || user.role === "SUPER_ADMIN" ? "/admin" : user.role === "B2B_BUYER" ? "/b2b" : "/dashboard"}>
              <Button className="bg-primary/10 hover:bg-primary/20 text-primary shadow-sm text-base font-semibold px-6 h-11 rounded-full gap-2">
                Halo, {user.name.split(" ")[0]}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:flex text-base font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20 text-base font-semibold px-6 h-11 rounded-full">
                  Daftar Sekarang
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <HeroCarousel />

        {/* Features Section */}
        <section id="features" className="w-full py-32 bg-slate-50 dark:bg-slate-950 relative border-t border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 -z-10"></div>
          
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-foreground ">
                Inovasi Utama <span className="text-primary">Eco Hub</span>
              </h2>
              <p className="max-w-[800px] text-foreground dark:text-foreground text-xl font-medium">
                Alat komprehensif untuk mengelola siklus daur ulang dari warga hingga ke industri.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Link href="/features/drop-off-pintar" className="feature-card md:col-span-2 group flex flex-col justify-end p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[320px] relative overflow-hidden cursor-pointer block">
                {/* Decorative element for bento grid */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                
                {/* 3D Floating Trash Image */}
                <div className="absolute -right-12 -top-12 md:-right-8 md:-top-16 w-[300px] md:w-[400px] h-[300px] md:h-[400px] pointer-events-none z-10 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)] opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                  <Image 
                    src="/images/3d-trash.jpg" 
                    alt="3D Eco Recycled Items" 
                    fill
                    className="float-3d-item object-contain mix-blend-multiply dark:opacity-80 dark:mix-blend-screen"
                    priority
                  />
                </div>

                <div className="relative z-20 md:w-1/2">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl mb-6 w-fit group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300">
                    <Recycle className="h-8 w-8 text-emerald-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-emerald-500 transition-colors duration-300">Drop-off Pintar</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Pemindaian QR code cepat oleh Admin RW untuk mencatat berat sampah seketika.
                  </p>
                </div>
              </Link>

              <Link href="/features/sistem-gamifikasi" className="feature-card md:col-span-1 group flex flex-col justify-between p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[320px] relative overflow-hidden cursor-pointer block">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]"></div>
                
                {/* 3D Floating Image */}
                <div className="absolute -right-8 -top-8 w-[220px] h-[220px] pointer-events-none z-10 [mask-image:radial-gradient(circle_at_center,black_45%,transparent_70%)] opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                  <Image 
                    src="/images/3d-gamification.jpg" 
                    alt="3D Gamification" 
                    fill
                    className="float-3d-item object-contain mix-blend-multiply dark:opacity-80 dark:mix-blend-screen"
                  />
                </div>
                
                <div className="p-4 bg-blue-500/10 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300 relative z-20">
                  <BarChart3 className="h-8 w-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <div className="relative z-10 mt-8">
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-blue-500 transition-colors duration-300">Sistem Gamifikasi</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Dapatkan Eco-Points dari setiap kontribusi dan raih peringkat teratas.
                  </p>
                </div>
              </Link>

              <Link href="/features/eco-commerce" className="feature-card md:col-span-1 group flex flex-col justify-between p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[320px] relative overflow-hidden cursor-pointer block">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px]"></div>
                
                {/* 3D Floating Image */}
                <div className="absolute -right-8 -top-8 w-[220px] h-[220px] pointer-events-none z-10 [mask-image:radial-gradient(circle_at_center,black_45%,transparent_70%)] opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                  <Image 
                    src="/images/3d-commerce.jpg" 
                    alt="3D Eco Commerce" 
                    fill
                    className="float-3d-item object-contain mix-blend-multiply dark:opacity-80 dark:mix-blend-screen"
                  />
                </div>
                
                <div className="p-4 bg-amber-500/10 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-300 relative z-20">
                  <Leaf className="h-8 w-8 text-amber-500 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <div className="relative z-10 mt-8">
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-amber-500 transition-colors duration-300">Eco-Commerce</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Tukarkan poin dengan diskon eksklusif produk ramah lingkungan.
                  </p>
                </div>
              </Link>

              <Link href="/features/volunteer-hub" className="feature-card md:col-span-2 group flex flex-col justify-end p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[320px] relative overflow-hidden cursor-pointer block">
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/3"></div>
                
                {/* 3D Floating Image */}
                <div className="absolute -right-12 -top-12 md:-right-8 md:-top-16 w-[300px] md:w-[400px] h-[300px] md:h-[400px] pointer-events-none z-10 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)] opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                  <Image 
                    src="/images/3d-volunteer.jpg" 
                    alt="3D Volunteer Hub" 
                    fill
                    className="float-3d-item object-contain mix-blend-multiply dark:opacity-80 dark:mix-blend-screen"
                  />
                </div>
                
                <div className="relative z-20 md:w-2/3">
                  <div className="p-4 bg-purple-500/10 rounded-2xl mb-6 w-fit group-hover:scale-110 group-hover:bg-purple-500 transition-all duration-300">
                    <MapPin className="h-8 w-8 text-purple-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-purple-500 transition-colors duration-300">Volunteer Hub</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Temukan dan ikuti kegiatan sosial pelestarian lingkungan di sekitar daerah Anda.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-32 bg-white dark:bg-slate-900 relative border-t border-slate-200 dark:border-slate-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-foreground ">
                Bagaimana <span className="text-primary">Cara Kerjanya?</span>
              </h2>
              <p className="max-w-[800px] text-foreground dark:text-foreground text-xl font-medium">
                Sistem yang didesain agar sangat mudah digunakan oleh semua kalangan, mengubah sampah menjadi berkah dalam 3 langkah sederhana.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 w-2/3 h-1.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0 mx-auto rounded-full"></div>
              
              {/* Step 1 */}
              <div className="step-card relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-4xl font-black shadow-sm shadow-slate-900/20 border-8 border-white dark:border-slate-900 transition-transform hover:scale-110">1</div>
                <h3 className="text-2xl font-heading font-extrabold text-foreground ">Pilah Sampah</h3>
                <p className="text-foreground dark:text-foreground font-medium text-lg leading-relaxed">Pisahkan sampah bernilai (plastik PET, kertas, kardus, logam) dari sampah rumah tangga lainnya.</p>
              </div>
              
              {/* Step 2 */}
              <div className="step-card relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-4xl font-black shadow-sm shadow-slate-900/20 border-8 border-white dark:border-slate-900 transition-transform hover:scale-110">2</div>
                <h3 className="text-2xl font-heading font-extrabold text-foreground ">Drop-off & Scan QR</h3>
                <p className="text-foreground dark:text-foreground font-medium text-lg leading-relaxed">Bawa ke titik drop-off RW terdekat, tunjukkan QR Code Anda untuk dipindai oleh Admin.</p>
              </div>
              
              {/* Step 3 */}
              <div className="step-card relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-4xl font-black shadow-sm shadow-slate-900/20 border-8 border-white dark:border-slate-900 transition-transform hover:scale-110">3</div>
                <h3 className="text-2xl font-heading font-extrabold text-foreground ">Raih Keuntungan</h3>
                <p className="text-foreground dark:text-foreground font-medium text-lg leading-relaxed">Dapatkan Eco-Points seketika dan tukarkan dengan berbagai diskon produk upcycled di Eco-Commerce.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Community Impact & Catalog Section */}
        <section id="community-impact" className="w-full py-32 bg-slate-50 dark:bg-slate-950 relative border-t border-slate-200 dark:border-slate-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-foreground">
                Dampak Nyata <span className="text-primary">Komunitas Kita</span>
              </h2>
              <p className="max-w-[800px] text-foreground dark:text-foreground text-xl font-medium">
                Bersama-sama, warga telah memberikan kontribusi luar biasa untuk menjaga kelestarian lingkungan sekitar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Impact Card 1 */}
              <div className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <Recycle className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-5xl font-black text-foreground mb-2 flex items-center justify-center">
                  <AnimatedCounter value={12450} suffix=" kg" />
                </div>
                <p className="text-lg text-muted-foreground font-semibold">Total Sampah Didaur Ulang</p>
              </div>

              {/* Impact Card 2 */}
              <div className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <TreePine className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-5xl font-black text-foreground mb-2 flex items-center justify-center">
                  <AnimatedCounter value={342} prefix="~ " suffix="" />
                </div>
                <p className="text-lg text-muted-foreground font-semibold">Ekuivalen Pohon Diselamatkan</p>
              </div>

              {/* Impact Card 3 */}
              <div className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <Wind className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-5xl font-black text-foreground mb-2 flex items-center justify-center">
                  <AnimatedCounter value={5200} suffix=" kg" />
                </div>
                <p className="text-lg text-muted-foreground font-semibold">Emisi Karbon Dicegah</p>
              </div>
            </div>

            {/* Catalog Banner */}
            <div className="w-full bg-primary/10 border border-primary/20 rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
              
              <div className="relative z-10 md:w-2/3 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-bold text-sm">
                  <ShoppingCart className="w-4 h-4" /> Tukarkan Poinmu
                </div>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-foreground leading-[1.1]">
                  Katalog Produk <span className="text-primary">Eco-Friendly</span>
                </h3>
                <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                  Ubah poin daur ulangmu menjadi barang-barang berguna hasil karya UMKM lokal dan produk sirkular. Mulai dari tas daur ulang, kompos, hingga kerajinan tangan.
                </p>
              </div>
              <div className="relative z-10 md:w-1/3 flex justify-center md:justify-end">
                <Link href="/marketplace">
                  <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-xl hover:shadow-primary/25 hover:-translate-y-1 transition-all group">
                    Lihat Katalog Produk
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="w-full py-32 bg-primary dark:bg-emerald-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          
          {/* Subtle gradient overlay to make text pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent dark:from-emerald-950/80"></div>

          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-20">

              <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight">
                Mencapai Target Global
              </h2>
              <p className="max-w-[800px] text-emerald-50 text-xl font-medium">
                Eco Hub bukan sekadar aplikasi, ini adalah ekosistem untuk mewujudkan Tujuan Pembangunan Berkelanjutan (SDGs) di tingkat akar rumput.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="impact-card bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md rounded-[32px] p-8 border border-white/20 hover:-translate-y-1 transition-transform">
                <h4 className="text-6xl font-bold text-emerald-300 mb-6 tracking-tighter drop-shadow-sm">7</h4>
                <p className="font-semibold text-2xl mb-3">Energi Bersih</p>
                <p className="text-emerald-50/80 font-medium leading-relaxed">Mendukung konversi residu sampah menjadi sumber energi biomassa yang berkelanjutan.</p>
              </div>
              <div className="impact-card bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md rounded-[32px] p-8 border border-white/20 hover:-translate-y-1 transition-transform">
                <h4 className="text-6xl font-bold text-emerald-300 mb-6 tracking-tighter drop-shadow-sm">8</h4>
                <p className="font-semibold text-2xl mb-3">Ekonomi Sirkular</p>
                <p className="text-emerald-50/80 font-medium leading-relaxed">Menciptakan lapangan kerja hijau dan peluang sirkular ekonomi untuk komunitas lokal.</p>
              </div>
              <div className="impact-card bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md rounded-[32px] p-8 border border-white/20 hover:-translate-y-1 transition-transform">
                <h4 className="text-6xl font-bold text-emerald-300 mb-6 tracking-tighter drop-shadow-sm">9</h4>
                <p className="font-semibold text-2xl mb-3">Inovasi Industri</p>
                <p className="text-emerald-50/80 font-medium leading-relaxed">Menghubungkan rantai pasok daur ulang ke industri (B2B) secara digital dan transparan.</p>
              </div>
              <div className="impact-card bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md rounded-[32px] p-8 border border-white/20 hover:-translate-y-1 transition-transform">
                <h4 className="text-6xl font-bold text-emerald-300 mb-6 tracking-tighter drop-shadow-sm">11</h4>
                <p className="font-semibold text-2xl mb-3">Kota Berkelanjutan</p>
                <p className="text-emerald-50/80 font-medium leading-relaxed">Mengurangi beban TPA dan mewujudkan lingkungan pemukiman (RT/RW) yang bersih.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6 px-4 md:px-6 mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <span className="font-extrabold text-2xl text-foreground ">
              Eco<span className="text-primary">Hub</span>
            </span>
          </div>
          <p className="text-base font-medium text-foreground dark:text-foreground">
            © 2026 Eco Hub - ITechno Cup 2026. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
