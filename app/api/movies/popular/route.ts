import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Movie from "@/models/Movie";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { parsePagination } from "@/lib/validation";

// GET /api/movies/popular
// ?window=all|24h|7d   (default: all)
// ?type=movie|series
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp, 20, 100);
    const window = sp.get("window") ?? "all";
    const type = sp.get("type");

    const filter: Record<string, unknown> = { status: "published" };
    if (type) filter.type = type;

    // Time window filter
    if (window === "24h") {
      filter.updatedAt = {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
    } else if (window === "7d") {
      filter.updatedAt = {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    } else if (window !== "all") {
      return badRequest('Invalid window. Use: all | 24h | 7d');
    }

    // Popularity score = views * 0.7 + rating * 0.3 (via aggregation)
    const [data, totalArr] = await Promise.all([
      Movie.aggregate([
        { $match: filter },
        {
          $addFields: {
            popularityScore: {
              $add: [
                { $multiply: ["$views", 0.7] },
                { $multiply: ["$rating", 30] }, // rating 0-10 → scale up
              ],
            },
          },
        },
        { $sort: { popularityScore: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { __v: 0, popularityScore: 0 } },
      ]),
      Movie.aggregate([
        { $match: filter },
        { $count: "total" },
      ]),
    ]);

    const total = totalArr[0]?.total ?? 0;

    return ok({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        window,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
