"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Recycle, QrCode, Gift } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name.split(" ")[0]);
      } catch (e) {}
    }
  }, []);

  const handleContinue = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "SUPER_ADMIN" || user.role === "ADMIN_RW") {
          router.push("/admin");
          return;
        } else if (user.role === "B2B_BUYER") {
          router.push("/b2b");
          return;
        }
      } catch (e) {}
    }
    router.push("/dashboard");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] -z-10"></div>

      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Greeting */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
            Selamat Datang, <br className="md:hidden" />
            <span className="text-primary">{userName}</span>.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Terima kasih telah bergabung. Mari kita mulai perjalanan Anda mengubah sampah menjadi nilai nyata.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full py-8">
          
          <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Recycle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">1. Pilah</h3>
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              Pisahkan sampah daur ulang (plastik, kertas, botol) di rumah Anda.
            </p>
          </div>

          <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <QrCode className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">2. Setor</h3>
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              Bawa ke titik kumpul RW dan tunjukkan QR Code Anda untuk dipindai.
            </p>
          </div>

          <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <Gift className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">3. Untung</h3>
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              Kumpulkan Eco-Points dan tukarkan dengan berbagai benefit menarik.
            </p>
          </div>

        </div>

        {/* Action */}
        <div className="w-full flex justify-center pt-4">
          <Button 
            onClick={handleContinue}
            size="lg" 
            className="h-14 px-10 text-lg font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105"
          >
            Mulai Eksplorasi <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

      </div>
    </div>
  );
}
