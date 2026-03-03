"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Heart, Clock, LogOut, Settings, Save } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "watchlist" | "history";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "profile";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [name, setName] = useState("");
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetchWatchlist();
      fetchHistory();
    }
  }, [session]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      if (data.ok) {
        setWatchlist(data.data);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/watch-progress");
      const data = await res.json();
      if (data.ok) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (data.ok) {
        await update({ name });
        setMessage("Profil berhasil diperbarui");
      } else {
        setMessage(data.error?.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground-muted mb-4">Silakan login terlebih dahulu</p>
          <a
            href="/login"
            className="px-6 py-2 bg-accent-gold text-background rounded-lg hover:bg-accent-gold-hover transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Profil</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "profile"
                ? "bg-accent-gold text-background"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <User className="w-4 h-4 inline-block mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab("watchlist")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "watchlist"
                ? "bg-accent-gold text-background"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <Heart className="w-4 h-4 inline-block mr-2" />
            Watchlist
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "history"
                ? "bg-accent-gold text-background"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <Clock className="w-4 h-4 inline-block mr-2" />
            Riwayat
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-md">
            <div className="bg-card p-6 rounded-xl space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-accent-gold flex items-center justify-center">
                    <span className="text-2xl font-bold text-background">
                      {session.user?.name?.[0] || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{session.user?.name}</p>
                  <p className="text-sm text-foreground-muted">{session.user?.email}</p>
                  <p className="text-xs text-accent-gold mt-1 capitalize">
                    {session.user?.role}
                  </p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <Input
                  label="Nama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                />

                {message && (
                  <p className={cn(
                    "text-sm",
                    message.includes("berhasil") ? "text-green-500" : "text-red-500"
                  )}>
                    {message}
                  </p>
                )}

                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === "watchlist" && (
          <div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlist.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-muted">Watchlist masih kosong</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {history.map((item) => (
                  <MovieCard key={item._id} movie={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-muted">Belum ada riwayat tontonan</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}