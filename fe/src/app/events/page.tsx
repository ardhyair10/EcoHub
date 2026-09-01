"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Leaf, ArrowLeft, Calendar, MapPin, Award, Users, CheckCircle2,
  Ticket, X, Loader2, Sparkles, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeFetchJson } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface EventItem {
  id: string;
  title: string;
  description?: string;
  location: string;
  date: string;
  reward_points: number;
  max_attendees?: number;
  is_active: boolean;
  _count?: { participants: number };
}

interface MyParticipation {
  id: string;
  event_id: string;
  status: "REGISTERED" | "ATTENDED";
  event: EventItem;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myEvents, setMyEvents] = useState<MyParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MyParticipation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setCurrentUserId(JSON.parse(userStr).id); } catch {}
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [evRes, myRes] = await Promise.all([
          fetch(`${API}/api/events`),
          token ? fetch(`${API}/api/events/my`, { headers }).catch(() => null) : null,
        ]);

        const evData = await safeFetchJson(evRes);
        if (evData.success) setEvents(evData.data.events);

        if (myRes?.ok) {
          const myData = await safeFetchJson(myRes);
          if (myData.success) setMyEvents(myData.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleJoin = async (eventId: string) => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setJoiningId(eventId);
    setMessage(null);

    try {
      const res = await fetch(`${API}/api/events/${eventId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeFetchJson(res);

      if (data.success) {
        setMessage({ type: "success", text: data.message || "Berhasil mendaftar event!" });
        setMyEvents((prev) => [...prev, data.data]);
        setSelectedTicket(data.data);
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mendaftar" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setJoiningId(null);
    }
  };

  const joinedEventIds = new Set(myEvents.map((m) => m.event_id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 h-16 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800  bg-card ">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">Volunteer Hub</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary via-emerald-600 to-teal-700 rounded-lg p-6 sm:p-8 text-white shadow-sm shadow-primary/20 mb-8 relative overflow-hidden">
          <div className="max-w-lg space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card  text-xs font-bold uppercase">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Event Komunitas
            </span>
            <h1 className="text-3xl font-heading font-black">Ikut Aksi, Raih Poin!</h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Bergabunglah dalam kegiatan kerja bakti & edukasi daur ulang di RW kamu. Dapatkan reward Eco-Points setiap menghadiri event!
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {message.type === "success" ? <Check className="h-5 w-5 flex-shrink-0" /> : <X className="h-5 w-5 flex-shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Event List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-lg p-12 text-center border border-slate-200 dark:border-slate-800">
            <Users className="h-14 w-14 text-foreground dark:text-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground text-lg">Belum Ada Event</p>
            <p className="text-sm text-muted-foreground mt-1">Kegiatan volunteer mendatang akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Kegiatan Mendatang
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => {
                const isJoined = joinedEventIds.has(ev.id);
                const myParticipation = myEvents.find((m) => m.event_id === ev.id);
                const isAttended = myParticipation?.status === "ATTENDED";

                return (
                  <div
                    key={ev.id}
                    className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          +{ev.reward_points} Poin Reward
                        </span>
                        {isJoined && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isAttended
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {isAttended ? " Hadir" : "Terdaftar"}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-lg text-foreground leading-snug">{ev.title}</h3>
                      {ev.description && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{ev.description}</p>}

                      <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {new Date(ev.date).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {ev._count?.participants || 0}
                            {ev.max_attendees ? ` / ${ev.max_attendees}` : ""} Peserta
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                      {isJoined ? (
                        <Button
                          variant="outline"
                          className="w-full font-bold gap-2 text-primary border-primary/30"
                          onClick={() => setSelectedTicket(myParticipation!)}
                        >
                          <Ticket className="h-4 w-4" /> Lihat Tiket Presensi
                        </Button>
                      ) : (
                        <Button
                          className="w-full font-bold gap-2"
                          onClick={() => handleJoin(ev.id)}
                          disabled={joiningId === ev.id}
                        >
                          {joiningId === ev.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Ikut Serta (RSVP)
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* QR Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] bg-black/60  flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full text-center space-y-4 relative shadow-sm" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground">Tiket Presensi Event</h3>
            <p className="text-xs text-muted-foreground">{selectedTicket.event.title}</p>

            <div className="bg-white p-4 rounded-lg border border-slate-200 inline-block shadow-sm">
              <QRCodeSVG
                value={JSON.stringify({ event_id: selectedTicket.event_id, citizen_id: currentUserId })}
                size={160}
                fgColor="#10b981"
                level="H"
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Tunjukkan QR Tiket ini ke Admin RW di lokasi event untuk mencatat presensi & mendapatkan +{selectedTicket.event.reward_points} poin.
            </p>

            <Button variant="outline" className="w-full font-bold" onClick={() => setSelectedTicket(null)}>
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
