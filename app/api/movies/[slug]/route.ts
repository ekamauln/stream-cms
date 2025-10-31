import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Invalid movie slug" },
        { status: 400 }
      );
    }

    const movie = await db.movie.findUnique({
      where: { slug },
      include: {
        categories: true,
      },
    });

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Invalid movie slug" }, { status: 400 });
    }

    const {
      title,
      newSlug,
      synopsis,
      releaseYear,
      duration,
      language,
      posterUrl,
      videoUrl,
      isPublished,
      featured,
      categoryIds,
      metaTitle,
      metaDescription,
      metaKeywords
    } = body;

    // First check if movie exists
    const existingMovie = await db.movie.findUnique({
      where: { slug }
    });

    if (!existingMovie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    // If changing slug, check if new slug is available
    if (newSlug && newSlug !== slug) {
      const slugExists = await db.movie.findUnique({
        where: { slug: newSlug }
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    const movie = await db.movie.update({
      where: { slug },
      data: {
        title,
        slug: newSlug || slug,
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
          set: categoryIds?.map((categoryId: number) => ({
            id: categoryId
          })) || [],
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error updating movie:", error);
    return NextResponse.json(
      { error: "Failed to update movie" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Invalid movie slug" }, { status: 400 });
    }

    // Check if movie exists
    const existingMovie = await db.movie.findUnique({
      where: { slug }
    });

    if (!existingMovie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    await db.movie.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting movie:", error);
    return NextResponse.json(
      { error: "Failed to delete movie" },
      { status: 500 }
    );
  }
}
