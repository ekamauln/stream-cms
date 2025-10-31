import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/comments - Get comments (with filtering by movieId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const approved = searchParams.get('approved');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      movieId?: number;
      isApproved?: boolean;
    } = {};
    
    if (movieId) {
      where.movieId = parseInt(movieId);
    }
    
    if (approved !== null) {
      where.isApproved = approved === 'true';
    }

    // Get comments with user and movie info
    const comments = await db.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        movie: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await db.comment.count({ where });

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      movieId, 
      userId, 
      authorName, 
      authorEmail, 
      text,
      ipAddress 
    } = body;

    // Validation
    if (!movieId || !text) {
      return NextResponse.json(
        { error: "Movie ID and comment text are required" },
        { status: 400 }
      );
    }

    // If no userId, require authorName for guest comments
    if (!userId && !authorName) {
      return NextResponse.json(
        { error: "Author name is required for guest comments" },
        { status: 400 }
      );
    }

    // Check if movie exists
    const movie = await db.movie.findUnique({
      where: { id: parseInt(movieId) }
    });

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        movieId: parseInt(movieId),
        userId: userId || null,
        authorName: authorName || null,
        authorEmail: authorEmail || null,
        text,
        ipAddress: ipAddress || null,
        isApproved: !!userId // Auto-approve if user is logged in, require manual approval for guests
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        movie: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(comment, { status: 201 });

  } catch {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
