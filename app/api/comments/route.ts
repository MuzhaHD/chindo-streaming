import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createCommentSchema = z.object({
  movieId: z.string(),
  episodeId: z.string().optional(),
  parentId: z.string().optional(),
  content: z.string().min(1).max(2000),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

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

    const skip = (page - 1) * limit;

    // Get top-level comments
    const [comments, total] = await Promise.all([
      Comment.find({
        movieId,
        parentId: null,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ movieId, parentId: null }),
    ]);

    // Get user info for each comment
    const commentsWithUser = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findById(comment.userId).select("name image").lean();
        return {
          ...comment,
          user: user ? {
            name: user.name,
            image: user.image,
          } : null,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      data: commentsWithUser,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil komentar",
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
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Komentar tidak valid",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Check if parent comment exists (for replies)
    if (parsed.data.parentId) {
      const parentComment = await Comment.findById(parsed.data.parentId).lean();
      if (!parentComment) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_FOUND",
              message: "Komentar utama tidak ditemukan",
            },
          },
          { status: 404 }
        );
      }

      // Check nesting level
      if (parentComment.parentId) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NESTING_ERROR",
              message: "Tidak dapat membalas komentar lebih dalam",
            },
          },
          { status: 400 }
        );
      }
    }

    const comment = await Comment.create({
      ...parsed.data,
      userId: session.user.id,
      movieId: parsed.data.movieId,
    });

    const user = await User.findById(session.user.id).select("name image").lean();

    return NextResponse.json({
      ok: true,
      data: {
        ...comment.toObject(),
        user: user ? {
          name: user.name,
          image: user.image,
        } : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CREATE_ERROR",
          message: "Gagal membuat komentar",
        },
      },
      { status: 500 }
    );
  }
}