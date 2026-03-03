"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import Input from "@/components/ui/Input";
import { Search, X } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      searchMovies(initialQuery, 1);
    }
  }, [initialQuery]);

  const searchMovies = async (q: string, pageNum: number) => {
    if (!q.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${pageNum}`);
      const data = await res.json();
      
      if (data.ok) {
        if (pageNum === 1) {
          setResults(data.data);
        } else {
          setResults((prev) => [...prev, ...data.data]);
        }
        setHasMore(data.meta.page < data.meta.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleLoadMore = () => {
    searchMovies(query, page + 1);
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Pencarian</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari film..."
              className="w-full pl-12 pr-12 py-4 bg-card border border-gray-700 rounded-xl text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-gold"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-foreground-muted" />
              </button>
            )}
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-foreground-muted mb-4">
              Ditemukan {results.length} hasil untuk &quot;{initialQuery}&quot;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
            
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-card text-foreground rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Muat lebih banyak
                </button>
              </div>
            )}
          </>
        ) : initialQuery ? (
          <div className="text-center py-16">
            <p className="text-foreground-muted">
              Tidak ada hasil untuk &quot;{initialQuery}&quot;
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}