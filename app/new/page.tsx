import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";

export const dynamic = "force-dynamic";

async function getNewMovies() {
  await connectDB();

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [lastDay, lastWeek] = await Promise.all([
    Movie.find({ createdAt: { $gte: dayAgo } })
      .sort({ createdAt: -1 })
      .lean(),
    Movie.find({
      createdAt: { $gte: weekAgo, $lt: dayAgo },
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return { lastDay, lastWeek };
}

export default async function NewPage() {
  const { lastDay, lastWeek } = await getNewMovies();

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Rilis Terbaru</h1>
        <p className="text-foreground-muted mb-8">Episode dan film terbaru</p>

        {/* 24 Jam Terakhir */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            24 Jam Terakhir
          </h2>
          {lastDay.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {lastDay.map((movie: any) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-foreground-muted">Tidak ada film dalam 24 jam terakhir</p>
          )}
        </section>

        {/* 7 Hari Terakhir */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-gold" />
            7 Hari Terakhir
          </h2>
          {lastWeek.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {lastWeek.map((movie: any) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-foreground-muted">Tidak ada film dalam 7 hari terakhir</p>
          )}
        </section>
      </div>
    </div>
  );
}