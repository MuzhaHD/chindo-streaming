
"use client";

import { cn } from "@/lib/utils";

const genres = [
  "Sci-Fi",
  "Romance",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Music",
  "Fantasy",
  "Drama",
  "Comedy",
  "Adventure",
  "Action",
];

interface GenrePillsProps {
  selectedGenre?: string;
  onSelectGenre?: (genre: string) => void;
  className?: string;
}

export default function GenrePills({
  selectedGenre,
  onSelectGenre,
  className,
}: GenrePillsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto scrollbar-hide pb-2",
        className
      )}
    >
      <button
        onClick={() => onSelectGenre?.("all")}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
          !selectedGenre || selectedGenre === "all"
            ? "bg-accent-gold text-background"
            : "bg-card text-foreground hover:bg-gray-700"
        )}
      >
        Semua
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelectGenre?.(genre)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            selectedGenre === genre
              ? "bg-accent-gold text-background"
              : "bg-card text-foreground hover:bg-gray-700"
          )}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}