"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowLeft, Recycle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  weight_kg: number;
  points_awarded: number;
  created_at: string;
  notes?: string;
  waste_category: { name: string; icon_url?: string };
  admin: { name: string };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/transactions/my?page=${page}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data.transactions);
          setPagination(data.data.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 px-6 h-16 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">Riwayat Transaksi</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <Recycle className="h-14 w-14 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="font-semibold text-muted-foreground text-lg">Belum ada transaksi</p>
              <p className="text-sm text-muted-foreground mt-1">
                Setorkan sampah ke pos drop-off untuk mulai mengumpulkan poin.
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm text-muted-foreground font-medium">
                  Total <span className="text-foreground font-bold">{pagination?.total}</span> transaksi
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Recycle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{tx.waste_category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.weight_kg} kg · Dicatat oleh {tx.admin.name}
                      </p>
                      {tx.notes && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{tx.notes}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-primary">+{tx.points_awarded} pts</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </Button>
                  <span className="text-sm text-muted-foreground font-medium">
                    {page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="gap-1"
                  >
                    Berikutnya <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
