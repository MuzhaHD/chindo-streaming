import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Episode from "@/models/Episode";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createEpisodeSchema = z.object({
  episodeNumber: z.number().min(1),
  title: z.string().min(1),
  duration: z.number().default(0),
  videoSources: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["mp4", "hls", "iframe"]),
      url: z.string(),
    })
  ),
});

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

    const episodes = await Episode.find({ movieId: movie._id })
      .sort({ episodeNumber: 1 })
      .lean();

    return NextResponse.json({
      ok: true,
      data: episodes,
    });
  } catch (error) {
    console.error("Error fetching episodes:", error);
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          },
        },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const parsed = createEpisodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Data tidak valid",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const episode = await Episode.create({
      ...parsed.data,
      movieId: movie._id,
    });

    // Update movie status to ongoing if it's a series
    if (movie.type === "series") {
      await Movie.updateOne(
        { _id: movie._id },
        { status: "ongoing" }
      );
    }

    return NextResponse.json({
      ok: true,
      data: episode,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating episode:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "DUPLICATE_ERROR",
            message: "Nomor episode sudah ada",
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CREATE_ERROR",
          message: "Gagal membuat episode",
        },
      },
      { status: 500 }
    );
  }
}