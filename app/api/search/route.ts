import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        ok: true,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const searchRegex = new RegExp(query.trim(), "i");
    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      Movie.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { genres: searchRegex },
        ],
      })
        .sort({ totalViews: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Movie.countDocuments({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { genres: searchRegex },
        ],
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: movies,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SEARCH_ERROR",
          message: "Gagal melakukan pencarian",
        },
      },
      { status: 500 }
    );
  }
}