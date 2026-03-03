import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
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
    const { commentId } = await params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Komentar tidak ditemukan",
          },
        },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const likedIndex = comment.likedBy.findIndex(
      (id) => id.toString() === userId
    );

    if (likedIndex > -1) {
      // Unlike
      comment.likedBy.splice(likedIndex, 1);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // Like
      comment.likedBy.push(userId as any);
      comment.likesCount += 1;
    }

    await comment.save();

    return NextResponse.json({
      ok: true,
      data: {
        likesCount: comment.likesCount,
        isLiked: likedIndex === -1,
      },
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "LIKE_ERROR",
          message: "Gagal menyukai komentar",
        },
      },
      { status: 500 }
    );
  }
}