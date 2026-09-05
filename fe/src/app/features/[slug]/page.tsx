"use client";

import { useRef, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Feature data
const featureData = {
  "drop-off-pintar": {
    title: "Drop-off Pintar",
    subtitle: "Revolusi pencatatan daur ulang harian Anda.",
    description: "Sistem drop-off pintar kami memungkinkan Admin RW atau petugas bank sampah lokal memindai QR Code unik Anda untuk mencatat berat sampah seketika. Proses yang dulunya manual dan memakan waktu, kini selesai dalam hitungan detik. Semua data langsung tersinkronisasi dengan akun Anda secara real-time, memberikan transparansi penuh atas kontribusi lingkungan Anda.",
    image: "/images/3d-trash.jpg",
    benefits: [
      "Pencatatan real-time tanpa kertas",
      "Validasi instan oleh Admin RW",
      "Riwayat kontribusi transparan 100%",
      "Proses selesai di bawah 5 detik"
    ],
    color: "emerald"
  },
  "sistem-gamifikasi": {
    title: "Sistem Gamifikasi",
    subtitle: "Ubah kebiasaan baik menjadi pencapaian seru.",
    description: "Dapatkan Eco-Points dari setiap gram sampah yang Anda setorkan. Pantau peringkat Anda di Leaderboard tingkat RT/RW dan jadilah pahlawan lingkungan di komunitas Anda. Sistem badge kami memberikan apresiasi visual untuk setiap milestone pelestarian alam yang Anda raih, membuat proses pelestarian bumi terasa seperti permainan yang menyenangkan.",
    image: "/images/3d-gamification.jpg",
    benefits: [
      "Perolehan poin otomatis setiap setor",
      "Peringkat Leaderboard interaktif",
      "Pencapaian badge eksklusif",
      "Membangun kompetisi positif warga"
    ],
    color: "blue"
  },
  "eco-commerce": {
    title: "Eco-Commerce",
    subtitle: "Daur ulang sampah, dapatkan diskon spesial.",
    description: "Tukarkan Eco-Points yang telah Anda kumpulkan dengan berbagai voucher diskon untuk produk-produk ramah lingkungan. Kami bekerja sama dengan puluhan brand sustainable lokal untuk memberikan Anda reward terbaik sambil tetap menjaga kelestarian bumi. Berbuat baik pada alam kini juga baik untuk dompet Anda.",
    image: "/images/3d-commerce.jpg",
    benefits: [
      "Katalog reward produk sangat beragam",
      "Diskon eksklusif produk sustainable",
      "Penukaran poin instan tanpa ribet",
      "Dukungan langsung UMKM lokal hijau"
    ],
    color: "amber"
  },
  "volunteer-hub": {
    title: "Volunteer Hub",
    subtitle: "Terhubung dengan komunitas peduli lingkungan.",
    description: "Temukan, ikuti, atau bahkan buat sendiri kegiatan sosial pelestarian lingkungan di sekitar daerah Anda. Dari aksi bersih-bersih pantai hingga lokakarya daur ulang, Volunteer Hub adalah pusat pergerakan akar rumput untuk bumi yang lebih hijau. Jadilah bagian dari perubahan besar bersama relawan lainnya.",
    image: "/images/3d-volunteer.jpg",
    benefits: [
      "Direktori kegiatan lokal terkini",
      "Pendaftaran event satu klik",
      "Jejaring relawan aktif seluruh daerah",
      "Sertifikat digital untuk relawan"
    ],
    color: "purple"
  }
};

export default function FeatureDetail({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const data = featureData[unwrappedParams.slug as keyof typeof featureData];

  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Stagger text reveal from left
    tl.from(".feature-text-content > *", {
      x: -30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out"
    });

    // 3D image float (runs independently)
    gsap.to(".feature-3d-image", {
      y: -25,
      rotation: 4,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.5 // Start slightly after text starts revealing
    });
  }, { scope: containerRef });

  if (!data) {
    notFound();
  }

  // Dynamic styling based on feature color
  const bgColors = {
    emerald: "bg-emerald-500/10",
    blue: "bg-blue-500/10",
    amber: "bg-amber-500/10",
    purple: "bg-purple-500/10",
  };
  
  const textColors = {
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    amber: "text-amber-500",
    purple: "text-purple-500",
  };

  const glowColors = {
    emerald: "bg-emerald-500/20",
    blue: "bg-blue-500/20",
    amber: "bg-amber-500/20",
    purple: "bg-purple-500/20",
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-16 overflow-hidden relative">
      {/* Background elements */}
      <div className={`absolute top-0 right-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 z-0 ${glowColors[data.color as keyof typeof glowColors]}`}></div>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <Link href="/#features">
          <Button variant="ghost" className="mb-12 pl-0 hover:bg-transparent hover:opacity-70 transition-opacity flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="feature-text-content w-full md:w-1/2 space-y-8">
            <div>
              <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6 ${bgColors[data.color as keyof typeof bgColors]} ${textColors[data.color as keyof typeof textColors]} shadow-sm border border-white/20`}>
                Fitur Utama Eco Hub
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight text-foreground mb-6 leading-[1.1]">
                {data.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                {data.subtitle}
              </p>
            </div>

            <p className="text-lg text-foreground/80 leading-relaxed font-medium">
              {data.description}
            </p>

            <div className="space-y-5 pt-6 p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
              <h3 className="font-bold text-xl text-foreground">Keunggulan:</h3>
              <ul className="space-y-4">
                {data.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-4 text-muted-foreground font-medium text-lg">
                    <div className={`w-3 h-3 rounded-full ${bgColors[data.color as keyof typeof bgColors].replace('/10', '')} bg-opacity-100 shadow-sm`}></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 flex gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-10 font-bold h-14 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  Mulai Gunakan Fitur
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 relative flex justify-center items-center min-h-[400px] md:min-h-[600px] mt-12 md:mt-0">
            <div className={`absolute inset-0 rounded-full ${bgColors[data.color as keyof typeof bgColors]} blur-3xl transform rotate-3 scale-90 opacity-60`}></div>
            <div className="relative w-full h-[400px] md:h-[600px] z-10">
              <Image 
                src={data.image}
                alt={data.title}
                fill
                className="feature-3d-image object-contain drop-shadow-2xl mix-blend-multiply dark:opacity-90 dark:mix-blend-screen"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
