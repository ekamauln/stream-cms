import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    interface WhereConditions {
      OR?: Array<{
        name?: { contains: string; mode: string };
        description?: { contains: string; mode: string };
      }>;
    }

    const whereConditions: WhereConditions = {};

    // Build search conditions
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const categories = await db.category.findMany({
      where: whereConditions,
      include: {
        _count: {
          select: {
            movies: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || 
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug: finalSlug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug: finalSlug,
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

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
