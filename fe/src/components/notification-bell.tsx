"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, ShoppingBag, Calendar, Sparkles, X } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
  created_at: string;
  is_read: boolean;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/analytics/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeFetchJson(res);
      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unread_count || 0);
      }
    } catch {
      // Ignore background fetch errors silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0); // Clear badge on open
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full border border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all"
        aria-label="Pusat Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-heading font-bold text-sm text-foreground">Notifikasi Aktivitas</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Memuat notifikasi...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Belum ada notifikasi baru</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex gap-3 items-start transition-colors ${
                    !item.is_read ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    {item.title.includes("Setoran") ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : item.title.includes("Marketplace") ? (
                      <ShoppingBag className="h-4 w-4 text-sky-500" />
                    ) : (
                      <Calendar className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-foreground leading-snug">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

