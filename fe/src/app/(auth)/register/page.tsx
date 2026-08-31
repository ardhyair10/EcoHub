"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Leaf } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CITIZEN",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await safeFetchJson(res);

      if (data.success) {
        const otp = data.data?.otp_code || "";
        const query = new URLSearchParams({ email: formData.email, ...(otp ? { otp } : {}) }).toString();
        router.push(`/verify-otp?${query}`);
      } else {
        const otp = data.data?.otp_code || "";
        if (otp) {
          const query = new URLSearchParams({ email: formData.email, otp }).toString();
          router.push(`/verify-otp?${query}`);
          return;
        }
        setError(data.message || "Gagal melakukan registrasi");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full border-white/20 shadow-2xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 transition-all duration-300">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            Buat akun baru untuk mulai berkontribusi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/90 rounded-md border border-destructive/20 shadow-sm animate-fade-in-up">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">Nama Lengkap</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="John Doe" 
                required 
                value={formData.name} 
                onChange={handleChange}
                className="bg-white/50 dark:bg-slate-950/50 border-white/30 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nama@email.com" 
                required 
                value={formData.email} 
                onChange={handleChange}
                className="bg-white/50 dark:bg-slate-950/50 border-white/30 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={formData.password} 
                onChange={handleChange}
                className="bg-white/50 dark:bg-slate-950/50 border-white/30 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground font-semibold">Peran</Label>
              <select 
                id="role" 
                name="role" 
                className="flex h-10 w-full rounded-md border border-white/30 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                value={formData.role} 
                onChange={handleChange}
              >
                <option value="CITIZEN">Warga (Citizen)</option>
                <option value="ADMIN_RW">Admin RW</option>
                <option value="B2B_BUYER">Pembeli B2B</option>
              </select>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? "Memproses..." : "Daftar Akun"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <div className="text-sm font-medium text-muted-foreground">
            Sudah punya akun? <Link href="/login" className="text-primary hover:text-primary/80 transition-colors ml-1">Masuk di sini</Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
