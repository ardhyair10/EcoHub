"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { KeyRound } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await safeFetchJson(res);

      if (data.success) {
        // Redirect to reset password page with email param
        const query = new URLSearchParams({ email }).toString();
        router.push(`/reset-password?${query}`);
      } else {
        setError(data.message || "Gagal memproses permintaan");
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
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Lupa Password
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            Masukkan email Anda untuk menerima kode OTP reset password.
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
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/50 dark:bg-slate-950/50 border-white/30 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              />
            </div>
            
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? "Memproses..." : "Kirim OTP"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <div className="text-sm font-medium text-muted-foreground">
            Ingat password? <Link href="/login" className="text-primary hover:text-primary/80 transition-colors ml-1">Masuk kembali</Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
