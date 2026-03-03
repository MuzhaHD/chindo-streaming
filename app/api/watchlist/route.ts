import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import Movie from "@/models/Movie";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Silakan login terlebih dahulu",
          },
        },
        { status: 401 }
      );
    }

    await connectDB();

    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Get movie details
    const movieIds = watchlist.map((item) => item.movieId);
    const movies = await Movie.find({ _id: { $in: movieIds } }).lean();

    return NextResponse.json({
      ok: true,
      data: movies,
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil watchlist",
        },
      },
      { status: 500 }
    );
  }
}