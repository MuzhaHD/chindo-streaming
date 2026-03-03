import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createMovieSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  genres: z.array(z.string()),
  thumbnail: z.string().url(),
  backdrop: z.string().url(),
  rating: z.number().min(0).max(10).default(0),
  releaseYear: z.number(),
  type: z.enum(["movie", "series"]),
  status: z.enum(["ongoing", "completed"]),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const genre = searchParams.get("genre");
    const sort = searchParams.get("sort") || "totalViews";

    const query: Record<string, any> = {};

    if (genre && genre !== "all") {
      query.genres = genre;
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (sort === "rating") {
      sortOption.rating = -1;
    } else if (sort === "title") {
      sortOption.title = 1;
    } else {
      sortOption.totalViews = -1;
    }

    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      Movie.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Movie.countDocuments(query),
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
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil data film",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = createMovieSchema.safeParse(body);

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

    const movie = await Movie.create(parsed.data);

    return NextResponse.json({
      ok: true,
      data: movie,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating movie:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "DUPLICATE_ERROR",
            message: "Slug film sudah ada",
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
          message: "Gagal membuat film",
        },
      },
      { status: 500 }
    );
  }
}