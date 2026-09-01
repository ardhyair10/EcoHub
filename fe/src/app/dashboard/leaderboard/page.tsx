"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowLeft, Crown, Trophy, Medal, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeCard } from "@/components/ui/badge-card";
import { safeFetchJson } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LeaderboardEntry {
  rank: number;
  user: { id: string; name: string; email: string; eco_points: number };
  monthly_points: number;
  monthly_weight_kg: number;
  transaction_count: number;
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

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [period, setPeriod] = useState<{ label: string; month: number; year: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setCurrentUserId(JSON.parse(userStr).id); } catch {}
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const [lbRes, badgesRes] = await Promise.all([
          fetch(`${API}/api/leaderboard?month=${selectedMonth}&year=${selectedYear}`),
          token ? fetch(`${API}/api/leaderboard/badges`, { headers }).catch(() => null) : null,
        ]);

        const lbData = await safeFetchJson(lbRes);
        if (lbRes.ok && lbData.success) {
          setLeaderboard(lbData.data.leaderboard);
          setPeriod(lbData.data.period);
        }

        if (badgesRes?.ok) {
          const bd = await safeFetchJson(badgesRes);
          if (bd.success) setBadges(bd.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const medalColors = ["from-yellow-400 to-amber-500", "from-slate-300 to-slate-400", "from-amber-600 to-amber-700"];
  const medalBg = ["bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800", "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 px-6 h-16 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800  bg-card ">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <span className="font-heading font-bold text-lg">Leaderboard</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Month Selector */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {period && (
            <span className="text-sm text-muted-foreground font-medium ml-auto">
              {period.label}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-14 w-14 text-foreground dark:text-foreground mx-auto mb-4" />
            <p className="font-semibold text-muted-foreground text-lg">Belum ada data</p>
            <p className="text-sm text-muted-foreground mt-1">Belum ada transaksi di bulan ini.</p>
          </div>
        ) : (
          <>
            {/* Podium Top 3 */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {/* Reorder: 2nd, 1st, 3rd */}
              {[podium[1], podium[0], podium[2]].map((entry, displayIdx) => {
                if (!entry) return <div key={`empty-slot-${displayIdx}`} />;
                const actualRank = entry.rank;
                const isMe = entry.user?.id === currentUserId;
                return (
                  <div
                    key={`podium-rank-${actualRank}-${entry.user?.id || displayIdx}`}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${
                      medalBg[actualRank - 1]
                    } ${displayIdx === 1 ? "transform scale-105 shadow-lg" : ""} ${isMe ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${medalColors[actualRank - 1]} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                      {actualRank}
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {entry.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-center text-foreground leading-tight">
                      {entry.user.name.split(" ")[0]}
                    </p>
                    <p className="text-lg font-black text-primary">{entry.monthly_points}</p>
                    <p className="text-xs text-muted-foreground">poin</p>
                  </div>
                );
              })}
            </div>

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rest.map((entry) => {
                    const isMe = entry.user.id === currentUserId;
                    return (
                      <div
                        key={`leaderboard-row-${entry.rank}-${entry.user?.id || ''}`}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                          isMe ? "bg-primary/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="w-8 text-center text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {entry.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isMe ? "text-primary" : "text-foreground"}`}>
                            {entry.user.name} {isMe && "(Kamu)"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.transaction_count} transaksi · {entry.monthly_weight_kg} kg
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

            {/* Badges Section */}
            {badges.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Medal className="h-5 w-5 text-accent" />
                  <h3 className="font-heading font-bold text-foreground">Badge Pencapaian</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {badges.map(badge => (
                    <BadgeCard key={badge.id} {...badge} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
