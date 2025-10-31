import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/comments/[id] - Get single comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid comment ID is required" },
        { status: 400 }
      );
    }

    const comment = await db.comment.findUnique({
      where: { id: parseInt(id) },
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

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);

  } catch {
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

// PUT /api/comments/[id] - Update comment (mainly for approval status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid comment ID is required" },
        { status: 400 }
      );
    }

    const { isApproved, text } = body;

    // Check if comment exists
    const existingComment = await db.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Update comment
    const updatedComment = await db.comment.update({
      where: { id: parseInt(id) },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(text !== undefined && { text })
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

    return NextResponse.json(updatedComment);

  } catch {
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid comment ID is required" },
        { status: 400 }
      );
    }

    // Check if comment exists
    const existingComment = await db.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Delete comment
    await db.comment.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );

  } catch {
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
