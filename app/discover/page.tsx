import MovieCard from "@/components/MovieCard";
import GenrePills from "@/components/GenrePills";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ genre?: string }>;
}

async function getMovies(genre?: string) {
  await connectDB();

  const query: Record<string, any> = {};
  if (genre && genre !== "all") {
    query.genres = genre;
  }

  const movies = await Movie.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return movies;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const genre = params.genre || "all";
  
  const movies = await getMovies(genre);

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Discover</h1>
        <p className="text-foreground-muted mb-8">Temukan film favoritmu</p>

        {/* Genre Filter */}
        <div className="mb-6">
          <GenrePills selectedGenre={genre} />
        </div>

        {/* Movie Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie: any) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-foreground-muted">Tidak ada film ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}