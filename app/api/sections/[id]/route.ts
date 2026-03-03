import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Section from "@/models/Section";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSectionSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["hero", "carousel", "feed", "genrePills", "custom"]).optional(),
  value: z.string().min(1).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    const body = await request.json();
    const parsed = updateSectionSchema.safeParse(body);

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

    const section = await Section.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true }
    );

    if (!section) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Section tidak ditemukan",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: section,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPDATE_ERROR",
          message: "Gagal memperbarui section",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    const section = await Section.findByIdAndDelete(id);

    if (!section) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Section tidak ditemukan",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { message: "Section berhasil dihapus" },
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "DELETE_ERROR",
          message: "Gagal menghapus section",
        },
      },
      { status: 500 }
    );
  }
}