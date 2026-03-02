import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Movie from "@/models/Movie";
import { getSessionOrToken, requireAdmin } from "@/lib/api-auth";
import {
  ok,
  created,
  paginated,
  badRequest,
  serverError,
} from "@/lib/api-response";
import { parsePagination, sanitizeSort } from "@/lib/validation";
import slugify from "@/lib/slugify";

const SORT_FIELDS = ["releaseYear", "rating", "views", "createdAt", "title"];

// GET /api/movies  – list movies (public, with filters)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp, 20, 100);

    const filter: Record<string, unknown> = { status: "published" };

    // Optional: admin can see drafts
    const user = await getSessionOrToken(req);
    if (user?.role === "admin" && sp.get("status")) {
      filter.status = sp.get("status");
    }

    if (sp.get("type")) filter.type = sp.get("type");
    if (sp.get("genre")) filter.genres = { $in: [sp.get("genre")] };
    if (sp.get("year")) filter.releaseYear = parseInt(sp.get("year")!, 10);

    const sortField = sanitizeSort(sp.get("sort"), SORT_FIELDS, "createdAt");
    const sortOrder = sp.get("order") === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      Movie.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      Movie.countDocuments(filter),
    ]);

    return paginated(data, { page, limit, total });
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/movies  – create movie (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const body = await req.json();
    const {
      title,
      description,
      poster,
      backdrop,
      genres,
      releaseYear,
      rating,
      type,
      status,
      cast,
      director,
      tags,
    } = body;

    if (!title || !description || !poster || !genres?.length || !releaseYear || !type) {
      return badRequest("Missing required fields: title, description, poster, genres, releaseYear, type");
    }

    // Ensure unique slug
    let slug = slugify(title);
    const existing = await Movie.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const movie = await Movie.create({
      title,
      slug,
      description,
      poster,
      backdrop,
      genres,
      releaseYear,
      rating: rating ?? 0,
      type,
      status: status ?? "draft",
      cast,
      director,
      tags,
    });

    return created(movie);
  } catch (err) {
    if ((err as Error).message === "UNAUTHORIZED") {
      return import("@/lib/api-response").then((m) => m.unauthorized());
    }
    if ((err as Error).message === "FORBIDDEN") {
      return import("@/lib/api-response").then((m) => m.forbidden());
    }
    return serverError(err);
  }
}
