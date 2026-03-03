"use client";

import { cn } from "@/lib/utils";

interface VideoSource {
  key: string;
  label: string;
  type: "mp4" | "hls" | "iframe";
  url: string;
}

interface SourceSwitcherProps {
  sources: VideoSource[];
  currentSource: string;
  onSourceChange: (source: VideoSource) => void;
}

export default function SourceSwitcher({
  sources,
  currentSource,
  onSourceChange,
}: SourceSwitcherProps) {
  if (sources.length <= 1) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-foreground-muted mb-2">
        GANTI PLAYER:
      </h3>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <button
            key={source.key}
            onClick={() => onSourceChange(source)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              currentSource === source.key
                ? "bg-accent-gold text-background"
                : "bg-card text-foreground hover:bg-gray-700"
            )}
          >
            {source.label}
          </button>
        ))}
      </div>
    </div>
  );
}