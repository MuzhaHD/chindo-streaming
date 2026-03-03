import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // day or week
    const limit = parseInt(searchParams.get("limit") || "10");

    let dateFilter: Date;
    const now = new Date();

    if (period === "day") {
      dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const movies = await Movie.find({
      createdAt: { $gte: dateFilter },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      ok: true,
      data: movies,
    });
  } catch (error) {
    console.error("Error fetching new movies:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil film terbaru",
        },
      },
      { status: 500 }
    );
  }
}