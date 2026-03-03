import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Episode from "@/models/Episode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const movie = await Movie.findOne({ slug }).lean();

    if (!movie) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Film tidak ditemukan",
          },
        },
        { status: 404 }
      );
    }

    // Get episode count
    const episodeCount = await Episode.countDocuments({ movieId: movie._id });

    // Increment views
    await Movie.updateOne(
      { _id: movie._id },
      { $inc: { totalViews: 1 } }
    );

    return NextResponse.json({
      ok: true,
      data: {
        ...movie,
        episodeCount,
      },
    });
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil detail film",
        },
      },
      { status: 500 }
    );
  }
}