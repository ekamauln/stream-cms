"use client";

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/custom-ui/movie-card";
import { CustomPagination } from "@/components/custom-ui/pagination";
import { SearchBar } from "@/components/custom-ui/search-bar";
import { Film, Loader2 } from "lucide-react";

// API Response types
interface ApiMovie {
  id: number;
  title: string;
  slug: string;
  synopsis?: string | null;
  releaseYear?: number | null;
  duration?: number | null;
  language?: string | null;
  posterUrl?: string | null;
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface ApiResponse {
  movies: ApiMovie[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}

// Component types
interface Movie {
  id: number;
  title: string;
  slug: string;
  synopsis?: string;
  releaseYear?: number;
  duration?: number;
  language?: string;
  posterUrl?: string | null;
  isPublished: boolean;
  featured: boolean;
  viewCount: number;
  createdAt: Date;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface CategoryMoviesClientProps {
  categorySlug: string;
  categoryName: string;
}

export function CategoryMoviesClient({ categorySlug, categoryName }: CategoryMoviesClientProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch movies for this category
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        
        const params = new URLSearchParams();
        params.set("published", "true");
        params.set("category", categorySlug);
        params.set("page", currentPage.toString());
        params.set("limit", "20");
        
        if (searchQuery) {
          params.set("search", searchQuery);
        }

        const response = await fetch(`/api/movies?${params.toString()}`);
        if (response.ok) {
          const data: ApiResponse = await response.json();
          
          // Transform API data to match component expectations
          const transformedMovies: Movie[] = data.movies.map((movie: ApiMovie) => ({
            ...movie,
            synopsis: movie.synopsis || undefined,
            releaseYear: movie.releaseYear || undefined,
            duration: movie.duration || undefined,
            language: movie.language || undefined,
            viewCount: 0, // Default viewCount since API doesn't return this
            createdAt: new Date(movie.createdAt),
          }));
          
          setMovies(transformedMovies);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        } else {
          setMovies([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch {
        setMovies([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [categorySlug, currentPage, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={`Search movies in ${categoryName}...`}
        />
        
        {/* Results count */}
        <div className="mt-2 text-sm text-muted-foreground">
          {!isLoading && (
            <>
              {searchQuery ? (
                <span>Found {totalCount} movies matching &ldquo;{searchQuery}&rdquo; in {categoryName}</span>
              ) : (
                <span>{totalCount} movies in {categoryName}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading movies...</span>
        </div>
      )}

      {/* Movies Grid */}
      {!isLoading && (
        <>
          {movies.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-8">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No Movies Found" : `No Movies in ${categoryName}`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No movies match &ldquo;${searchQuery}&rdquo; in the ${categoryName} category.`
                  : `There are no published movies in the ${categoryName} category yet.`
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary hover:underline"
                >
                  Clear search to see all movies in this category
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}