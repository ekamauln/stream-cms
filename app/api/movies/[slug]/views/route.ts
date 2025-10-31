import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(
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

    // Future: Add rate limiting here if needed

    // Check if movie exists and is published
    const existingMovie = await db.movie.findUnique({
      where: { 
        slug,
        isPublished: true
      }
    });

    if (!existingMovie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    // Increment view count atomically
    const updatedMovie = await db.movie.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        viewCount: true
      }
    });

    // Add CORS headers for better browser support
    const response = NextResponse.json({ 
      success: true, 
      viewCount: updatedMovie.viewCount 
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}