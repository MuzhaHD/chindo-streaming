import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Episode from "@/models/Episode";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    await connectDB();
    const { episodeId } = await params;

    const episode = await Episode.findById(episodeId).lean();

    if (!episode) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Episode tidak ditemukan",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: episode,
    });
  } catch (error) {
    console.error("Error fetching episode:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil episode",
        },
      },
      { status: 500 }
    );
  }
}