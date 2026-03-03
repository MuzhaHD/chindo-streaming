"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatViews } from "@/lib/utils";
import Button from "./ui/Button";

interface Movie {
  _id: string;
  title: string;
  slug: string;
  description: string;
  backdrop: string;
  genres: string[];
  rating: number;
  totalViews: number;
}

interface HeroSliderProps {
  movies: Movie[];
  isInWatchlist?: (movieId: string) => boolean;
}

export default function HeroSlider({ movies, isInWatchlist }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const handleAddToWatchlist = async (e: React.MouseEvent, movieId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });
      // Trigger a refresh or update state
      window.location.reload();
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh]">
      <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              {/* Backdrop */}
              <div className="absolute inset-0">
                <Image
                  src={movie.backdrop}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-xl">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 text-xs font-medium bg-card/80 backdrop-blur-sm rounded-full text-foreground"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">
                    {movie.title}
                  </h1>

                  <p className="text-foreground-muted mb-4 line-clamp-3">
                    {movie.description}
                  </p>

                  <div className="flex items-center gap-4 mb-6 text-sm">
                    <span className="flex items-center gap-1 text-accent-gold">
                      <span className="text-lg">★</span>
                      {movie.rating.toFixed(1)}
                    </span>
                    <span className="text-foreground-muted">
                      {formatViews(movie.totalViews)} views
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/watch/${movie.slug}`}>
                      <Button size="lg" className="gap-2">
                        <Play className="w-5 h-5" />
                        Tonton Sekarang
                      </Button>
                    </Link>
                    {isInWatchlist && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={(e) => handleAddToWatchlist(e, movie._id)}
                        className="gap-2"
                      >
                        <Heart
                          className={cn(
                            "w-5 h-5",
                            isInWatchlist(movie._id) && "fill-accent-gold text-accent-gold"
                          )}
                        />
                        {isInWatchlist(movie._id) ? "Dalam Watchlist" : "Tambah ke Watchlist"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === selectedIndex
                ? "bg-accent-gold w-8"
                : "bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}