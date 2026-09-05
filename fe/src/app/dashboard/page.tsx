"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Leaf, LogOut, History, Award, Package, TrendingUp,
  ChevronRight, Recycle, Trophy, Target, Crown,
  FileText, Users, Building2, TreePine, Wind, Droplets, Fuel, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProgressRing } from "@/components/ui/progress-ring";
import { BadgeCard } from "@/components/ui/badge-card";
import { ImpactCertificate } from "@/components/impact-certificate";
import { NotificationBell } from "@/components/notification-bell";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { safeFetchJson } from "@/lib/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  status?: string;
  waste_category: { name: string };
  admin: { name: string };
}

interface MonthlyStats {
  monthly_points: number;
  monthly_weight_kg: number;
  monthly_transactions: number;
  rank: number | null;
  total_participants: number;
  target_points: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface LeaderboardEntry {
  rank: number;
  user: { id: string; name: string; eco_points: number };
  monthly_points: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!loading && user) {
      // Animations removed temporarily to prevent opacity 0 bug
    }
  }, { scope: containerRef, dependencies: [loading, user] });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [userRes, txRes, statsRes, badgesRes, lbRes, analyticsRes] = await Promise.all([
          fetch(`${API}/api/users/me`, { headers }),
          fetch(`${API}/api/transactions/my?limit=5`, { headers }),
          fetch(`${API}/api/leaderboard/monthly-stats`, { headers }).catch(() => null),
          fetch(`${API}/api/leaderboard/badges`, { headers }).catch(() => null),
          fetch(`${API}/api/leaderboard`).catch(() => null),
          fetch(`${API}/api/analytics/community`).catch(() => null),
        ]);

        const userData = await safeFetchJson(userRes);
        if (!userRes.ok || !userData.success) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        if (userData.data?.role === "ADMIN_RW" || userData.data?.role === "SUPER_ADMIN") {
          router.push("/admin");
          return;
        }
        if (userData.data?.role === "B2B_BUYER") {
          router.push("/b2b");
          return;
        }
        setUser(userData.data);
        localStorage.setItem("user", JSON.stringify(userData.data));

        const txData = await safeFetchJson(txRes);
        if (txData.success) setTransactions(txData.data.transactions);

        if (statsRes?.ok) {
          const sd = await safeFetchJson(statsRes);
          if (sd.success) setMonthlyStats(sd.data);
        }
        if (badgesRes?.ok) {
          const bd = await safeFetchJson(badgesRes);
          if (bd.success) setBadges(bd.data);
        }
        if (lbRes?.ok) {
          const ld = await safeFetchJson(lbRes);
          if (ld.success) setLeaderboard(ld.data.leaderboard.slice(0, 5));
        }
        if (analyticsRes?.ok) {
          const ad = await safeFetchJson(analyticsRes);
          if (ad.success) setAnalytics(ad.data);
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const dashboardInterval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(dashboardInterval);
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
          <p className="text-muted-foreground font-medium animate-pulse">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  const isAdmin = user.role === "ADMIN_RW";
  const progressPercent = monthlyStats ? Math.min((monthlyStats.monthly_points / monthlyStats.target_points) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" ref={containerRef}>

      <header className="sticky top-0 z-50 px-6 lg:px-10 h-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-card ">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Leaf className="h-7 w-7 text-primary" />
          </div>
          <span className="text-2xl font-heading font-extrabold tracking-tight">
            Eco<span className="text-primary">Hub</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationBell />
          <Link href="/marketplace">
            <Button variant="outline" className="h-10 gap-2 font-bold px-5 text-sm">
              <Package className="h-5 w-5" />
              <span className="hidden sm:inline">Marketplace</span>
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="outline" className="h-10 gap-2 font-bold px-5 text-sm">
              <Users className="h-5 w-5" />
              <span className="hidden sm:inline">Volunteer</span>
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="h-10 gap-2 font-bold px-5 text-sm">
                <Recycle className="h-5 w-5" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Button>
            </Link>
          )}
          <Button variant="ghost" onClick={handleLogout} className="h-10 gap-2 text-muted-foreground hover:text-foreground font-bold px-4 text-sm">
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-[1400px]">
        <div className="dashboard-header mb-8">
          <h1 className="text-3xl font-heading font-black text-foreground">
            Halo, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            {isAdmin ? "Panel Admin RW · Eco Hub" : "Dashboard Warga · Eco Hub"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="dashboard-card bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-sm border border-white/20 dark:border-white/5 p-8 flex flex-col items-center text-center gap-4">
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
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <QRCodeSVG value={user.qr_code_id} size={160} fgColor="#10b981" level="H" includeMargin={false} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tunjukkan QR Code ini ke Admin RW saat menyetorkan sampah
              </p>
            </div>

            {monthlyStats && (
              <div className="dashboard-card bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-sm border border-white/20 dark:border-white/5 p-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-heading font-bold text-foreground">Target Bulan Ini</h3>
                </div>
                <ProgressRing progress={progressPercent} size={140} strokeWidth={10}>
                  <p className="text-3xl font-black text-primary">{monthlyStats.monthly_points}</p>
                  <p className="text-xs text-muted-foreground">/ {monthlyStats.target_points} poin</p>
                </ProgressRing>
                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{monthlyStats.monthly_weight_kg} kg</p>
                    <p className="text-xs text-muted-foreground">Berat Bulan Ini</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{monthlyStats.monthly_transactions}</p>
                    <p className="text-xs text-muted-foreground">Transaksi Bulan Ini</p>
                  </div>
                </div>
                {monthlyStats.rank && (
                  <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-2 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-accent" />
                    <span className="text-sm font-bold text-foreground">
                      Peringkat #{monthlyStats.rank}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      dari {monthlyStats.total_participants} warga
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="dashboard-card bg-primary text-primary-foreground border-transparent rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-primary-foreground/80" />
                  <span className="text-sm font-semibold text-primary-foreground/80">Total Saldo Poin</span>
                </div>
                <p className="text-4xl font-black">{user.eco_points.toLocaleString()}</p>
                <p className="text-sm text-primary-foreground/70 mt-1">Saldo poin aktif dapat ditukar</p>
              </div>
              <div className="dashboard-card bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] p-6 border border-white/20 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">Total Setoran</span>
                </div>
                <p className="text-4xl font-black text-foreground">
                  {user._count?.transactions_as_citizen ?? 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Transaksi tervalidasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button onClick={() => setShowCert(true)} className="dashboard-card h-auto py-5 flex flex-col gap-2 rounded-[20px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-foreground border border-white/20 dark:border-white/5 hover:bg-white/80 shadow-sm transition-transform hover:scale-[0.98]">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-semibold text-sm">Sertifikat Impact</span>
              </Button>
              <Link href="/events" className="w-full">
                <Button className="dashboard-card w-full h-auto py-5 flex flex-col gap-2 rounded-[20px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-foreground border border-white/20 dark:border-white/5 hover:bg-white/80 shadow-sm transition-transform hover:scale-[0.98]">
                  <Users className="h-6 w-6 text-emerald-500" />
                  <span className="font-semibold text-sm">Volunteer Hub</span>
                </Button>
              </Link>
              {user.role === "ADMIN_RW" || user.role === "B2B_BUYER" ? (
                <Link href="/b2b" className="w-full">
                  <Button className="dashboard-card w-full h-auto py-5 flex flex-col gap-2 rounded-[20px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-foreground border border-white/20 dark:border-white/5 hover:bg-white/80 shadow-sm transition-transform hover:scale-[0.98]">
                    <Building2 className="h-6 w-6 text-secondary" />
                    <span className="font-semibold text-sm">B2B Bulk Waste</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/leaderboard" className="w-full">
                  <Button className="dashboard-card w-full h-auto py-5 flex flex-col gap-2 rounded-[20px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-foreground border border-white/20 dark:border-white/5 hover:bg-white/80 shadow-sm transition-transform hover:scale-[0.98]">
                    <Crown className="h-6 w-6 text-amber-500" />
                    <span className="font-semibold text-sm">Leaderboard RW</span>
                  </Button>
                </Link>
              )}
            </div>

            {badges.length > 0 && (
              <div className="dashboard-card bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-white/20 dark:border-white/5 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <h3 className="font-heading font-bold text-foreground">Badge Saya</h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {badges.filter(b => b.unlocked).length}/{badges.length} diraih
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {badges.map(badge => (
                    <BadgeCard key={badge.id} {...badge} compact />
                  ))}
                </div>
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className="dashboard-card bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-white/20 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-accent" />
                    <h3 className="font-heading font-bold text-foreground">Leaderboard Bulan Ini</h3>
                  </div>
                  <Link href="/dashboard/leaderboard">
                    <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary font-semibold text-xs">
                      Lihat semua <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaderboard.map((entry) => {
                    const isMe = entry.user.id === user.id;
                    const medalColors = ['text-yellow-500', 'text-foreground', 'text-amber-600'];
                    return (
                      <div
                        key={entry.rank}
                        className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${
                          isMe ? "bg-primary/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className={`w-6 text-center text-sm font-black ${medalColors[entry.rank - 1] || 'text-muted-foreground'}`}>
                          #{entry.rank}
                        </span>
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {entry.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isMe ? "text-primary" : "text-foreground"}`}>
                            {entry.user.name} {isMe && "(Kamu)"}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {entry.monthly_points.toLocaleString()} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {analytics && (
              <div className="dashboard-card bg-white dark:bg-slate-900 text-foreground rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-heading font-bold text-lg text-foreground">Dampak Lingkungan (Komunitas)</h3>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-foreground dark:text-foreground text-xs font-semibold">
                    <Activity className="h-3 w-3" />
                    Metrik Real-time
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
                  <div className="bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center">
                    <TreePine className="h-5 w-5 text-emerald-500 mb-2 opacity-80" />
                    <p className="text-2xl font-black text-foreground">
                      <AnimatedCounter value={analytics.impact_equivalents?.trees_saved || 0} decimals={1} />
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">Pohon Diselamatkan</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center">
                    <Wind className="h-5 w-5 text-sky-500 mb-2 opacity-80" />
                    <p className="text-2xl font-black text-foreground">
                      <AnimatedCounter value={analytics.impact_equivalents?.carbon_saved_kg || 0} decimals={1} prefix="-" suffix=" kg" />
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">Reduksi Karbon (CO₂)</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center">
                    <Droplets className="h-5 w-5 text-blue-500 mb-2 opacity-80" />
                    <p className="text-2xl font-black text-foreground">
                      <AnimatedCounter value={analytics.impact_equivalents?.plastic_saved_kg || 0} decimals={1} prefix="-" suffix=" kg" />
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">Plastik Murni Dihemat</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center">
                    <Fuel className="h-5 w-5 text-amber-500 mb-2 opacity-80" />
                    <p className="text-2xl font-black text-foreground">
                      <AnimatedCounter value={analytics.impact_equivalents?.biofuel_liters || 0} decimals={1} suffix=" L" />
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">Potensi Biofuel</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span>Total Daur Ulang: <strong className="text-foreground"><AnimatedCounter value={analytics.total_weight_kg} decimals={1} suffix=" kg" /></strong></span>
                  <span>Partisipan: <strong className="text-primary"><AnimatedCounter value={analytics.total_citizens} decimals={0} suffix=" warga" /></strong></span>
                </div>
              </div>
            )}

            <div className="dashboard-card bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                  <Package className="h-12 w-12 text-foreground dark:text-foreground mb-3" />
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

      <ImpactCertificate
        userName={user.name}
        totalPoints={user.eco_points}
        totalTransactions={user._count?.transactions_as_citizen || 0}
        isOpen={showCert}
        onClose={() => setShowCert(false)}
      />
    </div>
  );
}
