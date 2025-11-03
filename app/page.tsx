"use client";

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/custom-ui/movie-card";
import { CategoryFilter } from "@/components/custom-ui/category-filter";
import { SearchBar } from "@/components/custom-ui/search-bar";
import { CustomPagination } from "@/components/custom-ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Type definitions for API response
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

// Type for MovieCard component
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

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch movies from API with pagination
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoadingMovies(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        params.set("published", "true");
        params.set("page", currentPage.toString());
        params.set("limit", "20");
        
        if (selectedCategory) {
          params.set("category", selectedCategory);
        }
        
        if (searchQuery) {
          params.set("search", searchQuery);
        }

        const response = await fetch(`/api/movies?${params.toString()}`);
        if (response.ok) {
          const data: ApiResponse = await response.json();
          
          // Validate response structure
          if (data && data.movies && Array.isArray(data.movies)) {
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
            // Invalid response structure
            setMovies([]);
            setTotalPages(1);
            setTotalCount(0);
          }
        } else {
          // Handle fetch error silently
          setMovies([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch {
        // Handle error silently
        setMovies([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setIsLoadingMovies(false);
      }
    };

    fetchMovies();
  }, [currentPage, selectedCategory, searchQuery]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          // Handle fetch error silently
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter movies based on search and category
  // Separate featured movies state
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  // Fetch featured movies separately (without pagination)
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        setIsLoadingFeatured(true);
        const response = await fetch("/api/movies?published=true&featured=true");
        if (response.ok) {
          const data: ApiResponse = await response.json();
          
          // Validate response structure
          if (data && data.movies && Array.isArray(data.movies)) {
            const transformedMovies: Movie[] = data.movies.map((movie: ApiMovie) => ({
              ...movie,
              synopsis: movie.synopsis || undefined,
              releaseYear: movie.releaseYear || undefined,
              duration: movie.duration || undefined,
              language: movie.language || undefined,
              viewCount: 0,
              createdAt: new Date(movie.createdAt),
            }));
            setFeaturedMovies(transformedMovies);
          } else {
            setFeaturedMovies([]);
          }
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, searchQuery, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // <div className="min-h-screen bg-background">
    //   <Header />

    <main className="container mx-auto px-4 py-8">
      {/* Featured Movies Section */}
      {!isLoadingFeatured && featuredMovies.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Featured Movies</h2>
            <Badge variant="secondary" className="ml-2">
              {featuredMovies.length}
            </Badge>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Movies Loading */}
      {isLoadingFeatured && (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Featured Movies</h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span className="text-muted-foreground">
              Loading featured movies...
            </span>
          </div>
        </section>
      )}

      <Separator className="my-6" />

      {/* Filters */}
      <section className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">All Movies</h2>
            <Badge variant="outline" className="ml-2">
              {totalCount}
            </Badge>
          </div>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="mt-4">
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-muted-foreground">
                Loading categories...
              </span>
            </div>
          ) : (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}
        </div>
      </section>

      {/* Movies Grid */}
      <section>
        {isLoadingMovies ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading movies...</span>
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {movies.map((movie: Movie) => (
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory
                ? "Try adjusting your filters or search query"
                : "No movies are available at the moment"}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </section>
    </main>

    //   <Footer />
    // </div>
  );
}
