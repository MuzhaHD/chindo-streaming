"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import { cn, formatViews } from "@/lib/utils";

interface MovieCardProps {
  movie: {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    rating: number;
    totalViews: number;
    genres?: string[];
  };
  className?: string;
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Link
      href={`/watch/${movie.slug}`}
      className={cn(
        "group block relative rounded-xl overflow-hidden bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent-gold/10",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-[2/3] relative overflow-hidden">
        <Image
          src={movie.thumbnail}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-accent-gold text-sm">
                <Star className="w-4 h-4 fill-accent-gold" />
                {movie.rating.toFixed(1)}
              </span>
              <span className="text-foreground-muted text-sm">
                {formatViews(movie.totalViews)} views
              </span>
            </div>
          </div>
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-4 rounded-full bg-accent-gold/90 gold-glow">
            <Play className="w-8 h-8 text-background fill-background" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate group-hover:text-accent-gold transition-colors">
          {movie.title}
        </h3>
        {movie.genres && movie.genres.length > 0 && (
          <p className="text-xs text-foreground-muted truncate mt-1">
            {movie.genres.slice(0, 2).join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}