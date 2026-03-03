import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Section from "@/models/Section";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSectionSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["hero", "carousel", "feed", "genrePills", "custom"]),
  value: z.string().min(1),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    await connectDB();

    const sections = await Section.find({})
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      ok: true,
      data: sections,
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "Gagal mengambil sections",
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
    const parsed = createSectionSchema.safeParse(body);

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

    const section = await Section.create(parsed.data);

    return NextResponse.json({
      ok: true,
      data: section,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CREATE_ERROR",
          message: "Gagal membuat section",
        },
      },
      { status: 500 }
    );
  }
}