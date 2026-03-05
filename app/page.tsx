import { Suspense } from "react";
import HeroSlider from "@/components/HeroSlider";
import GenrePills from "@/components/GenrePills";
import Carousel from "@/components/Carousel";
import MovieCard from "@/components/MovieCard";
import { HeroSkeleton } from "@/components/ui/Skeleton";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Section from "@/models/Section";

// Force dynamic for SSR
export const dynamic = "force-dynamic";

async function getHomeData() {
  await connectDB();
  
  // Get top 5 most viewed for hero
  const heroMovies = await Movie.find({})
    .sort({ totalViews: -1 })
    .limit(5)
    .lean();

  // Get sections
  const sections = await Section.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  // Get data for each section
  const sectionData: Record<string, any[]> = {};
  
  for (const section of sections) {
    if (section.value === "topViewed" || section.value === "popular") {
      sectionData[section.value] = await Movie.find({})
        .sort({ totalViews: -1 })
        .limit(10)
        .lean();
    } else if (section.value === "newEpisodes") {
      sectionData[section.value] = await Movie.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    } else if (section.value === "movieMarathon") {
      sectionData[section.value] = await Movie.find({ type: "movie" })
        .sort({ rating: -1 })
        .limit(10)
        .lean();
    } else if (section.value === "newDonghua") {
      sectionData[section.value] = await Movie.find({ type: "series" })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }
  }

  return { heroMovies, sections, sectionData };
}

export default async function HomePage() {
  const { heroMovies, sections, sectionData } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSlider movies={heroMovies as any} />
        </Suspense>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Genre Pills */}
        <section>
          <GenrePills />
        </section>

        {/* Dynamic Sections */}
        {sections.map((section) => (
          <section key={section._id?.toString()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
              {section.value === "newEpisodes" && (
                <a
                  href="/new"
                  className="text-sm text-accent-gold hover:underline"
                >
                  Tampilkan Semua
                </a>
              )}
            </div>
            
            <Suspense
              fallback={
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <MovieCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <Carousel>
                {(sectionData[section.value] || []).map((movie: any) => (
                  <div key={movie._id} className="flex-shrink-0 w-48 md:w-56">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </Carousel>
            </Suspense>
          </section>
        ))}

        {/* Fallback sections if no sections configured */}
        {sections.length === 0 && (
          <>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Paling Populer</h2>
                <a href="/popular" className="text-sm text-accent-gold hover:underline">
                  Tampilkan Semua
                </a>
              </div>
              <Carousel>
                {sectionData.popular?.map((movie: any) => (
                  <div key={movie._id} className="flex-shrink-0 w-48 md:w-56">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </Carousel>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Episode Terbaru</h2>
                <a href="/new" className="text-sm text-accent-gold hover:underline">
                  Tampilkan Semua
                </a>
              </div>
              <Carousel>
                {sectionData.newEpisodes?.map((movie: any) => (
                  <div key={movie._id} className="flex-shrink-0 w-48 md:w-56">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </Carousel>
            </section>
          </>
        )}
      </div>
    </div>
  );
}