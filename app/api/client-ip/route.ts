import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get client IP address for moderation purposes
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded 
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      '127.0.0.1';

  return NextResponse.json({ ip });
}