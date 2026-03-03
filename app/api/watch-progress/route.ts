import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WatchProgress from "@/models/WatchProgress";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProgressSchema = z.object({
  movieId: z.string(),
  episodeId: z.string(),
  currentTime: z.number().min(0),
  duration: z.number().min(0),
});

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

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "MISSING_PARAMS",
            message: "movieId diperlukan",
          },
        },
        { status: 400 }
      );
    }

    const progress = await WatchProgress.find({
      userId: session.user.id,
      movieId,
    }).lean();

    return NextResponse.json({
      ok: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil progress",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = updateProgressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Data tidak valid",
          },
        },
        { status: 400 }
      );
    }

    const { movieId, episodeId, currentTime, duration } = parsed.data;
    const isCompleted = duration > 0 && (currentTime / duration) >= 0.9;

    // Upsert watch progress
    const progress = await WatchProgress.findOneAndUpdate(
      {
        userId: session.user.id,
        movieId,
        episodeId,
      },
      {
        userId: session.user.id,
        movieId,
        episodeId,
        currentTime,
        duration,
        isCompleted,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      ok: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error updating watch progress:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPDATE_ERROR",
          message: "Gagal memperbarui progress",
        },
      },
      { status: 500 }
    );
  }
}