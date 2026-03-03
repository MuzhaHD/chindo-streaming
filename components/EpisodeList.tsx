"use client";

import Link from "next/link";
import { cn, formatDuration } from "@/lib/utils";
import { Play, CheckCircle } from "lucide-react";

interface Episode {
  _id: string;
  episodeNumber: number;
  title: string;
  duration: number;
}

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId?: string;
  slug: string;
  watchProgress?: Record<string, { isCompleted: boolean; currentTime: number }>;
}

export default function EpisodeList({
  episodes,
  currentEpisodeId,
  slug,
  watchProgress = {},
}: EpisodeListProps) {
  if (episodes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        Daftar Episode
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
        {episodes.map((episode) => {
          const progress = watchProgress[episode._id];
          const isActive = currentEpisodeId === episode._id;
          const isCompleted = progress?.isCompleted;

          return (
            <Link
              key={episode._id}
              href={`/watch/${slug}?episode=${episode._id}`}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors",
                isActive
                  ? "bg-accent-gold/20 border border-accent-gold"
                  : "bg-card hover:bg-gray-700"
              )}
            >
              {/* Episode Number / Status */}
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : isActive ? (
                  <Play className="w-5 h-5 text-accent-gold fill-accent-gold" />
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {episode.episodeNumber}
                  </span>
                )}
              </div>

              {/* Episode Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  Episode {episode.episodeNumber}: {episode.title}
                </h4>
                {episode.duration > 0 && (
                  <p className="text-xs text-foreground-muted">
                    {formatDuration(episode.duration)}
                  </p>
                )}
              </div>

              {/* Watch Progress Bar */}
              {progress && !isCompleted && progress.currentTime > 0 && (
                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gold"
                    style={{
                      width: `${Math.min(
                        (progress.currentTime / (progress.currentTime + 60)) * 100,
                        95
                      )}%`,
                    }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}