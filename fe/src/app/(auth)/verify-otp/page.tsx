"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthLayout } from "@/components/auth-layout";
import { Leaf } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const initialOtp = searchParams.get("otp") || "";
  
  const [otp, setOtp] = useState(initialOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Masukkan 6 digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
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
          router.push("/welcome");
        }
      } else {
        setError(data.message || "Kode OTP tidak valid");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-heading font-bold tracking-tight text-foreground">
          Verifikasi Email
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground font-medium">
          Kami telah mengirimkan kode 6-digit ke <strong>{email}</strong>
          {initialOtp ? <span className="mt-2 block text-sm text-primary">Kode sementara: <strong>{initialOtp}</strong></span> : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/90 rounded-md border border-destructive/20 shadow-sm animate-fade-in-up">
              {error}
            </div>
          )}
          
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot 
                    key={index} 
                    index={index} 
                    className="w-12 h-14 text-lg bg-card  border-border dark:border-slate-800 rounded-md shadow-sm transition-colors"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]" disabled={loading || otp.length !== 6}>
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
        <VerifyOtpForm />
      </Suspense>
    </AuthLayout>
  );
}
