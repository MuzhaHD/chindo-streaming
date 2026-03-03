"use client";

import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  slug: string;
  episodeId?: string;
  title: string;
  siteUrl: string;
}

export default function ShareButton({
  slug,
  episodeId,
  title,
  siteUrl,
}: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    let url = `${siteUrl}/watch/${slug}`;
    if (episodeId) {
      url += `?episode=${episodeId}`;
    }
    return url;
  };

  const handleShare = async () => {
    const url = getShareUrl();

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Tonton ${title} di CHINDO`,
          url: url,
        });
      } catch (error) {
        // User cancelled or error, fall back to copy
        if ((error as Error).name !== "AbortError") {
          await copyToClipboard(url);
        }
      }
    } else {
      // Fall back to copy
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
          "bg-card text-foreground hover:bg-gray-700 transition-colors"
        )}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {copied ? "Tersalin" : "Bagikan"}
      </button>

      {/* Toast */}
      {showToast && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-green-500 text-white text-sm rounded-lg whitespace-nowrap z-10">
          Link berhasil disalin!
        </div>
      )}
    </div>
  );
}