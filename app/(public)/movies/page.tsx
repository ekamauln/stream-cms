import { Metadata } from "next";
import { MoviesListClient } from "@/components/custom-ui/movies-list-client";

export const metadata: Metadata = {
  title: "All Movies - Stream CMS",
  description:
    "Browse our complete collection of movies across all genres and categories",
  keywords: "movies, streaming, films, entertainment, watch online",
};

export default function MoviesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">All Movies</h1>
        <p className="text-muted-foreground text-lg">
          Discover our complete collection of movies
        </p>
      </div>

      {/* Movies List with Pagination */}
      <MoviesListClient />
    </div>
  );
}
