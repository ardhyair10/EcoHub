"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, Recycle, MapPin, BarChart3, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroCarousel } from "@/components/hero-carousel";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Features Section Animation
    gsap.from(".feature-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#features",
        start: "top 75%",
      }
    });

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
        <nav className="hidden md:flex gap-10 text-base font-semibold text-foreground dark:text-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Fitur</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">Cara Kerja</Link>
          <Link href="#impact" className="hover:text-primary transition-colors">Dampak</Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex text-base font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20 text-base font-semibold px-6 h-11 rounded-full">
              Daftar Sekarang
            </Button>
          </Link>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="feature-card group flex flex-col items-center text-center p-10 bg-white dark:bg-slate-900 rounded-lg shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all hover:shadow-sm hover:-translate-y-2 hover:border-primary/50">
                <div className="p-5 bg-primary/10 rounded-lg mb-6 group-hover:scale-110 group-hover:bg-primary transition-all">
                  <Recycle className="h-10 w-10 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-heading font-extrabold mb-4 text-foreground ">Drop-off Pintar</h3>
                <p className="text-foreground dark:text-foreground font-medium leading-relaxed">
                  Pemindaian QR code cepat oleh Admin RW untuk mencatat berat sampah seketika.
                </p>
              </div>

              <div className="feature-card group flex flex-col items-center text-center p-10 bg-white dark:bg-slate-900 rounded-lg shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all hover:shadow-sm hover:-translate-y-2 hover:border-accent/50">
                <div className="p-5 bg-accent/10 rounded-lg mb-6 group-hover:scale-110 group-hover:bg-accent transition-all">
                  <BarChart3 className="h-10 w-10 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-heading font-extrabold mb-4 text-foreground ">Sistem Gamifikasi</h3>
                <p className="text-foreground dark:text-foreground font-medium leading-relaxed">
                  Dapatkan Eco-Points dari setiap kontribusi dan raih peringkat teratas di Leaderboard.
                </p>
              </div>

              <div className="feature-card group flex flex-col items-center text-center p-10 bg-white dark:bg-slate-900 rounded-lg shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all hover:shadow-sm hover:-translate-y-2 hover:border-secondary/50">
                <div className="p-5 bg-secondary/10 rounded-lg mb-6 group-hover:scale-110 group-hover:bg-secondary transition-all">
                  <Leaf className="h-10 w-10 text-secondary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-heading font-extrabold mb-4 text-foreground ">Eco-Commerce</h3>
                <p className="text-foreground dark:text-foreground font-medium leading-relaxed">
                  Tukarkan poin Anda dengan diskon eksklusif untuk produk-produk ramah lingkungan.
                </p>
              </div>

              <div className="feature-card group flex flex-col items-center text-center p-10 bg-white dark:bg-slate-900 rounded-lg shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all hover:shadow-sm hover:-translate-y-2 hover:border-primary/50">
                <div className="p-5 bg-primary/10 rounded-lg mb-6 group-hover:scale-110 group-hover:bg-primary transition-all">
                  <MapPin className="h-10 w-10 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-heading font-extrabold mb-4 text-foreground ">Volunteer Hub</h3>
                <p className="text-foreground dark:text-foreground font-medium leading-relaxed">
                  Temukan dan ikuti kegiatan sosial pelestarian lingkungan di sekitar daerah Anda.
                </p>
              </div>
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
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-black shadow-sm shadow-primary/40 border-8 border-white dark:border-slate-900 transition-transform hover:scale-110">1</div>
                <h3 className="text-2xl font-heading font-extrabold text-foreground ">Pilah Sampah</h3>
                <p className="text-foreground dark:text-foreground font-medium text-lg leading-relaxed">Pisahkan sampah bernilai (plastik PET, kertas, kardus, logam) dari sampah rumah tangga lainnya.</p>
              </div>
              
              {/* Step 2 */}
              <div className="step-card relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center text-4xl font-black shadow-sm shadow-accent/40 border-8 border-white dark:border-slate-900 transition-transform hover:scale-110">2</div>
                <h3 className="text-2xl font-heading font-extrabold text-foreground ">Drop-off & Scan QR</h3>
                <p className="text-foreground dark:text-foreground font-medium text-lg leading-relaxed">Bawa ke titik drop-off RW terdekat, tunjukkan QR Code Anda untuk dipindai oleh Admin.</p>
              </div>
              
              {/* Step 3 */}
              <div className="step-card relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-secondary text-white flex items-center justify-center text-4xl font-black shadow-sm shadow-secondary/40 border-8 border-white dark:border-slate-900 transition-transform hover:scale-110">3</div>
                <h3 className="text-2xl font-heading font-extrabold text-foreground ">Raih Keuntungan</h3>
                <p className="text-foreground dark:text-foreground font-medium text-lg leading-relaxed">Dapatkan Eco-Points seketika dan tukarkan dengan berbagai diskon produk upcycled di Eco-Commerce.</p>
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
              <div className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm  uppercase tracking-wider mb-2">
                Dampak Nyata
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight">
                Mencapai Target Global
              </h2>
              <p className="max-w-[800px] text-emerald-50 text-xl font-medium">
                Eco Hub bukan sekadar aplikasi, ini adalah ekosistem untuk mewujudkan Tujuan Pembangunan Berkelanjutan (SDGs) di tingkat akar rumput.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="impact-card bg-card rounded-2xl p-8 border border-border text-center hover:shadow-md hover:-translate-y-2 transition-all shadow-sm">
                <h4 className="text-6xl font-black text-primary mb-4 drop-shadow-sm">7</h4>
                <p className="font-bold text-xl mb-3 text-foreground">Energi Bersih</p>
                <p className="text-muted-foreground font-medium leading-relaxed">Mendukung konversi residu sampah menjadi sumber energi biomassa yang berkelanjutan.</p>
              </div>
              <div className="impact-card bg-card rounded-2xl p-8 border border-border text-center hover:shadow-md hover:-translate-y-2 transition-all shadow-sm">
                <h4 className="text-6xl font-black text-primary mb-4 drop-shadow-sm">8</h4>
                <p className="font-bold text-xl mb-3 text-foreground">Ekonomi Sirkular</p>
                <p className="text-muted-foreground font-medium leading-relaxed">Menciptakan lapangan kerja hijau dan peluang sirkular ekonomi untuk komunitas lokal.</p>
              </div>
              <div className="impact-card bg-card rounded-2xl p-8 border border-border text-center hover:shadow-md hover:-translate-y-2 transition-all shadow-sm">
                <h4 className="text-6xl font-black text-primary mb-4 drop-shadow-sm">9</h4>
                <p className="font-bold text-xl mb-3 text-foreground">Inovasi Industri</p>
                <p className="text-muted-foreground font-medium leading-relaxed">Menghubungkan rantai pasok daur ulang ke industri (B2B) secara digital dan transparan.</p>
              </div>
              <div className="impact-card bg-card rounded-2xl p-8 border border-border text-center hover:shadow-md hover:-translate-y-2 transition-all shadow-sm">
                <h4 className="text-6xl font-black text-primary mb-4 drop-shadow-sm">11</h4>
                <p className="font-bold text-xl mb-3 text-foreground">Kota Berkelanjutan</p>
                <p className="text-muted-foreground font-medium leading-relaxed">Mengurangi beban TPA dan mewujudkan lingkungan pemukiman (RT/RW) yang bersih.</p>
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
