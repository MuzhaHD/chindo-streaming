import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Eye, Calendar } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import SourceSwitcher from "@/components/SourceSwitcher";
import AdSlot from "@/components/AdSlot";
import EpisodeList from "@/components/EpisodeList";
import CommentSection from "@/components/CommentSection";
import Carousel from "@/components/Carousel";
import MovieCard from "@/components/MovieCard";
import ShareButton from "@/components/ShareButton";
import ReportModal from "@/components/ReportModal";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { formatViews, formatDate, cn } from "@/lib/utils";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Episode from "@/models/Episode";
import WatchProgress from "@/models/WatchProgress";
import { auth } from "@/lib/auth";
import WatchlistButton from "@/components/WatchlistButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ episode?: string }>;
}

async function getMovieData(slug: string) {
  await connectDB();

  const movie = await Movie.findOne({ slug }).lean();
  if (!movie) return null;

  const episodes = await Episode.find({ movieId: movie._id })
    .sort({ episodeNumber: 1 })
    .lean();

  return { movie, episodes };
}

async function getWatchProgress(userId: string, episodeIds: string[]) {
  await connectDB();
  
  const progress = await WatchProgress.find({
    userId,
    episodeId: { $in: episodeIds },
  }).lean();

  const progressMap: Record<string, any> = {};
  progress.forEach((p) => {
    progressMap[p.episodeId.toString()] = p;
  });

  return progressMap;
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { episode: episodeQuery } = await searchParams;
  
  const data = await getMovieData(slug);
  if (!data) notFound();

  const { movie, episodes } = data;
  const session = await auth();
  
  // Get current episode
  let currentEpisode = episodes[0];
  if (episodeQuery) {
    const found = episodes.find((e) => e._id.toString() === episodeQuery);
    if (found) currentEpisode = found;
  }

  // Get watch progress
  let watchProgress: Record<string, any> = {};
  if (session?.user?.id) {
    const episodeIds = episodes.map((e) => e._id.toString());
    watchProgress = await getWatchProgress(session.user.id, episodeIds);
  }

  // Get current source
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || "https://t.me/example";
  
  const currentSource = currentEpisode?.videoSources?.[0];
  const [currentVideoSource, setCurrentVideoSource] = useState(
    currentSource || null
  );

  // For client-side state
  const WatchPageContent = () => {
    const [selectedSource, setSelectedSource] = useState(currentSource);

    return (
      <>
        {/* Hero Info */}
        <div className="relative h-[50vh] md:h-[60vh]">
          <Image
            src={movie.backdrop}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
                <span className="flex items-center gap-1 text-accent-gold">
                  <Star className="w-4 h-4 fill-accent-gold" />
                  {movie.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatViews(movie.totalViews)} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {movie.releaseYear}
                </span>
                <span className="flex gap-2">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <span key={genre} className="px-2 py-0.5 bg-card/80 rounded text-xs">
                      {genre}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Video Player Section */}
          <div className="space-y-4">
            {selectedSource ? (
              <VideoPlayer
                src={selectedSource.url}
                type={selectedSource.type}
                initialTime={watchProgress[currentEpisode?._id.toString()]?.currentTime || 0}
              />
            ) : (
              <div className="w-full aspect-video bg-card rounded-xl flex items-center justify-center">
                <p className="text-foreground-muted">Tidak ada sumber video tersedia</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <WatchlistButton movieId={movie._id.toString()} />
                <ShareButton
                  slug={slug}
                  episodeId={currentEpisode?._id.toString()}
                  title={movie.title}
                  siteUrl={siteUrl}
                />
                <ReportModal
                  isOpen={false}
                  onClose={() => {}}
                  movieTitle={movie.title}
                  slug={slug}
                  episodeNumber={currentEpisode?.episodeNumber}
                  episodeId={currentEpisode?._id.toString()}
                  serverKey={selectedSource?.key || ""}
                  serverLabel={selectedSource?.label || ""}
                  telegramGroupUrl={telegramUrl}
                  siteUrl={siteUrl}
                />
              </div>
            </div>

            {/* Source Switcher */}
            {currentEpisode?.videoSources && currentEpisode.videoSources.length > 0 && (
              <SourceSwitcher
                sources={currentEpisode.videoSources}
                currentSource={selectedSource?.key || ""}
                onSourceChange={setSelectedSource}
              />
            )}

            {/* Description */}
            <div className="bg-card p-4 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Synopsis</h3>
              <p className="text-foreground-muted text-sm">{movie.description}</p>
            </div>

            {/* Ad Slot */}
            <AdSlot />
          </div>

          {/* Episode List */}
          {episodes.length > 0 && (
            <EpisodeList
              episodes={episodes as any}
              currentEpisodeId={currentEpisode?._id.toString()}
              slug={slug}
              watchProgress={watchProgress}
            />
          )}

          {/* Similar Movies */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Serupa</h2>
            <Carousel>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48 md:w-56">
                  <MovieCardSkeleton />
                </div>
              ))}
            </Carousel>
          </section>

          {/* Comments */}
          <CommentSection
            movieId={movie._id.toString()}
            episodeId={currentEpisode?._id.toString()}
          />
        </div>
      </>
    );
  };

  return <WatchPageContent />;
}