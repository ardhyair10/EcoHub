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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await safeFetchJson(res);

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        if (data.data.user?.role === "SUPER_ADMIN" || data.data.user?.role === "ADMIN_RW") {
          router.push("/admin");
        } else if (data.data.user?.role === "B2B_BUYER") {
          router.push("/b2b");
        } else {
          router.push("/");
        }
      } else {
        if (data.data?.require_otp) {
          const otp = data.data?.otp_code || "";
          const query = new URLSearchParams({ email: formData.email, ...(otp ? { otp } : {}) }).toString();
          router.push(`/verify-otp?${query}`);
        } else {
          setError(data.message || "Gagal masuk");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full border-0 shadow-none bg-transparent">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Selamat Datang
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            Masuk ke akun Eco Hub Anda
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
              <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nama@email.com" 
                required 
                value={formData.email} 
                onChange={handleChange}
                className="bg-card  border-border dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Lupa password?</Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={formData.password} 
                onChange={handleChange}
                className="bg-card  border-border dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <div className="text-sm font-medium text-muted-foreground">
            Belum punya akun? <Link href="/register" className="text-primary hover:text-primary/80 transition-colors ml-1">Daftar sekarang</Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
