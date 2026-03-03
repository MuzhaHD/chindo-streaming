import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import { auth } from "@/lib/auth";

export async function DELETE(
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

    // Allow delete if user is the comment owner or admin
    const isOwner = comment.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          ok: false,
          code: "FORBIDDEN",
          message: "Tidak memiliki izin untuk menghapus komentar ini",
        },
        { status: 403 }
      );
    }

    // Delete the comment and all its replies
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentId: commentId },
      ],
    });

    return NextResponse.json({
      ok: true,
      data: { message: "Komentar berhasil dihapus" },
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "DELETE_ERROR",
          message: "Gagal menghapus komentar",
        },
      },
      { status: 500 }
    );
  }
}