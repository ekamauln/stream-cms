"use client";

import { Film } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getSiteName } from "@/lib/site-utils";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">{getSiteName()}</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Movies
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Categories
          </Link>
          {/* Only show Dashboard link if user is authenticated */}
          {session && (
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          {/* Show Login link if user is not authenticated */}
          {!session && (
            <Link
              href="/auth/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
