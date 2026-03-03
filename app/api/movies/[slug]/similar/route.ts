import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";

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

    // Find similar movies by genres
    const similarMovies = await Movie.find({
      _id: { $ne: movie._id },
      genres: { $in: movie.genres },
    })
      .sort({ totalViews: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      ok: true,
      data: similarMovies,
    });
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil film serupa",
        },
      },
      { status: 500 }
    );
  }
}