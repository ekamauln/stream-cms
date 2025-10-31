import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const published = searchParams.get("published");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    interface WhereConditions {
      OR?: Array<{
        title?: { contains: string; mode: string };
        synopsis?: { contains: string; mode: string };
      }>;
      isPublished?: boolean;
      featured?: boolean;
      categories?: {
        some: {
          slug: string;
        };
      };
    }

    const whereConditions: WhereConditions = {};

    // Build search conditions
    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { synopsis: { contains: search, mode: "insensitive" } },
      ];
    }

    if (published !== null && published !== undefined) {
      whereConditions.isPublished = published === "true";
    }

    if (featured !== null && featured !== undefined) {
      whereConditions.featured = featured === "true";
    }

    if (category) {
      whereConditions.categories = {
        some: {
          slug: category,
        },
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db.movie.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalCount / limit);

    const movies = await db.movie.findMany({
      where: whereConditions,
      include: {
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      synopsis,
      releaseYear,
      duration,
      language,
      posterUrl,
      videoUrl,
      isPublished = false,
      featured = false,
      categoryIds = [],
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body;

    // Validate required fields
    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and video URL are required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

    // Check if slug already exists
    const existingMovie = await db.movie.findUnique({
      where: { slug: finalSlug },
    });

    if (existingMovie) {
      return NextResponse.json(
        { error: "A movie with this slug already exists" },
        { status: 409 }
      );
    }

    const movie = await db.movie.create({
      data: {
        title,
        slug: finalSlug,
        synopsis,
        releaseYear,
        duration,
        language,
        posterUrl,
        videoUrl,
        isPublished,
        featured,
        metaTitle,
        metaDescription,
        metaKeywords,
        categories: {
          connect: categoryIds.map((categoryId: number) => ({
            id: categoryId,
          })),
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error("Error creating movie:", error);
    return NextResponse.json(
      { error: "Failed to create movie" },
      { status: 500 }
    );
  }
}
