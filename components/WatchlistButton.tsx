"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface WatchlistButtonProps {
  movieId: string;
}

export default function WatchlistButton({ movieId }: WatchlistButtonProps) {
  const { data: session, status } = useSession();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      checkWatchlist();
    }
  }, [session, movieId]);

  const checkWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      if (data.ok) {
        setIsInWatchlist(data.data.some((m: any) => m._id === movieId));
      }
    } catch (error) {
      console.error("Error checking watchlist:", error);
    }
  };

  const handleToggle = async () => {
    if (status !== "authenticated") {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsInWatchlist(data.data.isInWatchlist);
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
        isInWatchlist
          ? "bg-accent-gold text-background"
          : "bg-card text-foreground hover:bg-gray-700"
      )}
    >
      <Heart
        className={cn("w-4 h-4", isInWatchlist && "fill-background")}
      />
      {isInWatchlist ? "Dalam Watchlist" : "Tambah ke Watchlist"}
    </button>
  );
}