
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import GenrePills from "@/components/GenrePills";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ genre?: string; sort?: string; page?: string }>;
}

async function getMovies(genre?: string, sort: string = "totalViews", page: number = 1) {
  await connectDB();

  const limit = 12;
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};
  if (genre && genre !== "all") {
    query.genres = genre;
  }

  const sortOption: Record<string, 1 | -1> = {};
  if (sort === "rating") {
    sortOption.rating = -1;
  } else if (sort === "title") {
    sortOption.title = 1;
  } else {
    sortOption.totalViews = -1;
  }

  const [movies, total] = await Promise.all([
    Movie.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
    Movie.countDocuments(query),
  ]);

  return {
    movies,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function PopularPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const genre = params.genre || "all";
  const sort = params.sort || "totalViews";
  const page = parseInt(params.page || "1");

  const { movies, meta } = await getMovies(genre, sort, page);

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Film Populer</h1>

        {/* Genre Filter */}
        <div className="mb-6">
          <GenrePills selectedGenre={genre} />
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mb-6">
          <Link
            href={`/popular?genre=${genre}&sort=totalViews`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sort === "totalViews"
                ? "bg-accent-gold text-background"
                : "bg-card text-foreground hover:bg-gray-700"
            }`}
          >
            Views
          </Link>
          <Link
            href={`/popular?genre=${genre}&sort=rating`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sort === "rating"
                ? "bg-accent-gold text-background"
                : "bg-card text-foreground hover:bg-gray-700"
            }`}
          >
            Rating
          </Link>
          <Link
            href={`/popular?genre=${genre}&sort=title`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sort === "title"
                ? "bg-accent-gold text-background"
                : "bg-card text-foreground hover:bg-gray-700"
            }`}
          >
            A-Z
          </Link>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie: any) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/popular?genre=${genre}&sort=${sort}&page=${pageNum}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page
                      ? "bg-accent-gold text-background"
                      : "bg-card text-foreground hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}