"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { KeyRound, ShieldCheck } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailQuery = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (otp.length < 6) {
      setError("Masukkan 6 digit kode OTP");
      setLoading(false);
      return;
    }

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailQuery, otp_code: otp, new_password: password }),
      });

      const data = await safeFetchJson(res);

      if (data.success) {
        router.push("/login");
      } else {
        setError(data.message || "Gagal mengubah password");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full border-0 shadow-none bg-transparent p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-500/20 rounded-full">
            <ShieldCheck className="w-12 h-12 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Berhasil!</h2>
        <p className="text-muted-foreground mb-6">{success}</p>
        <p className="text-sm text-muted-foreground">Mengarahkan ke halaman login...</p>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-heading font-bold tracking-tight text-foreground">
          Reset Password
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground font-medium">
          Masukkan kode OTP yang dikirim ke {emailQuery || "email Anda"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/90 rounded-md border border-destructive/20 shadow-sm animate-fade-in-up">
              {error}
            </div>
          )}
          
          <div className="space-y-3 flex flex-col items-center">
            <Label className="text-foreground font-semibold self-start">Kode OTP (6 digit)</Label>
            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-14 text-xl border-slate-300 dark:border-slate-700 bg-card " />
                <InputOTPSlot index={1} className="w-12 h-14 text-xl border-slate-300 dark:border-slate-700 bg-card " />
                <InputOTPSlot index={2} className="w-12 h-14 text-xl border-slate-300 dark:border-slate-700 bg-card " />
                <InputOTPSlot index={3} className="w-12 h-14 text-xl border-slate-300 dark:border-slate-700 bg-card " />
                <InputOTPSlot index={4} className="w-12 h-14 text-xl border-slate-300 dark:border-slate-700 bg-card " />
                <InputOTPSlot index={5} className="w-12 h-14 text-xl border-slate-300 dark:border-slate-700 bg-card " />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-semibold">Password Baru</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Minimal 8 karakter" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card  border-border dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
            />
          </div>
          
          <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
            {loading ? "Memproses..." : "Simpan Password Baru"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-center p-10">Memuat...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
