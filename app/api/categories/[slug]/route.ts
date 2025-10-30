import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: "Invalid category slug" },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: { slug },
      include: {
        movies: {
          where: {
            isPublished: true, // Only include published movies
          },
          select: {
            id: true,
            title: true,
            slug: true,
            synopsis: true,
            posterUrl: true,
            releaseYear: true,
            duration: true,
            featured: true,
            viewCount: true,
          },
        },
        _count: {
          select: {
            movies: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Invalid category slug" }, { status: 400 });
    }

    const {
      name,
      newSlug,
      description,
    } = body;

    // First check if category exists
    const existingCategory = await db.category.findUnique({
      where: { slug }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // If changing slug, check if new slug is available
    if (newSlug && newSlug !== slug) {
      const slugExists = await db.category.findUnique({
        where: { slug: newSlug }
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    const category = await db.category.update({
      where: { slug },
      data: {
        name,
        slug: newSlug || slug,
        description,
      },
      include: {
        _count: {
          select: {
            movies: true,
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ error: "Invalid category slug" }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            movies: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has movies (optional: prevent deletion if it has movies)
    if (existingCategory._count.movies > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated movies" },
        { status: 409 }
      );
    }

    await db.category.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
