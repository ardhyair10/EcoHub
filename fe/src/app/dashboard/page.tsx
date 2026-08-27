"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Leaf,
  LogOut,
  History,
  Award,
  Package,
  TrendingUp,
  ChevronRight,
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  eco_points: number;
  qr_code_id: string;
  _count?: { transactions_as_citizen: number };
}

interface Transaction {
  id: string;
  weight_kg: number;
  points_awarded: number;
  created_at: string;
  notes?: string;
  waste_category: { name: string };
  admin: { name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, txRes] = await Promise.all([
          fetch("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/transactions/my?limit=5", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userData = await userRes.json();
        const txData = await txRes.json();

        if (!userRes.ok || !userData.success) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        setUser(userData.data);
        if (txData.success) {
          setTransactions(txData.data.transactions);
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN_RW";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 px-6 lg:px-10 h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-heading font-extrabold tracking-tight">
            Eco<span className="text-primary">Hub</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2 font-semibold">
                <Recycle className="h-4 w-4" />
                Input Transaksi
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-black text-foreground">
            Halo, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            {isAdmin ? "Panel Admin RW · Eco Hub" : "Dashboard Warga · Eco Hub"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: QR Code */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  {user.role === "CITIZEN" ? "Warga" : user.role === "ADMIN_RW" ? "Admin RW" : "Pembeli B2B"}
                </span>
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <QRCodeSVG
                  value={user.qr_code_id}
                  size={160}
                  fgColor="#10b981"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tunjukkan QR Code ini ke Admin RW saat menyetorkan sampah
              </p>
              <p className="text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg break-all">
                {user.qr_code_id}
              </p>
            </div>
          </div>

          {/* Right: Stats + History */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-3xl p-5 text-white shadow-lg shadow-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-white/80" />
                  <span className="text-sm font-semibold text-white/80">Eco Points</span>
                </div>
                <p className="text-4xl font-black">{user.eco_points.toLocaleString()}</p>
                <p className="text-sm text-white/70 mt-1">Total poin terkumpul</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">Transaksi</span>
                </div>
                <p className="text-4xl font-black text-foreground">
                  {user._count?.transactions_as_citizen ?? 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total setoran</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="font-heading font-bold text-foreground">Riwayat Transaksi</h3>
                </div>
                <Link href="/dashboard/history">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary font-semibold text-xs">
                    Lihat semua <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <Package className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="font-semibold text-muted-foreground">Belum ada transaksi</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Setorkan sampah ke pos drop-off terdekat untuk mulai mengumpulkan poin.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                          <Recycle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{tx.waste_category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.weight_kg} kg · {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">+{tx.points_awarded}</p>
                        <p className="text-xs text-muted-foreground">poin</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
