"use client";

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/custom-ui/movie-card";
import { CustomPagination } from "@/components/custom-ui/pagination";
import { SearchBar } from "@/components/custom-ui/search-bar";
import { CategoryFilter } from "@/components/custom-ui/category-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Loader2, SlidersHorizontal } from "lucide-react";

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

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export function MoviesListClient() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch movies with pagination
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoadingMovies(true);
        
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
            setMovies([]);
            setTotalPages(1);
            setTotalCount(0);
          }
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
        setIsLoadingMovies(false);
      }
    };

    fetchMovies();
  }, [currentPage, selectedCategory, searchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, searchQuery, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div>
      {/* Filters Section */}
      <div className="mb-8 space-y-4">
        {/* Search and Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <span className="font-medium">Filter Movies</span>
            <Badge variant="outline" className="ml-2">
              {totalCount} {totalCount === 1 ? "movie" : "movies"}
            </Badge>
          </div>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search movies by title or description..."
          />
        </div>

        {/* Category Filter */}
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading categories...</span>
          </div>
        ) : (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary">
                Search: &ldquo;{searchQuery}&rdquo;
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary">
                Category: {categories.find(c => c.slug === selectedCategory)?.name}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingMovies && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading movies...</span>
        </div>
      )}

      {/* Movies Grid */}
      {!isLoadingMovies && (
        <>
          {movies.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              <h3 className="text-xl font-semibold mb-2">No Movies Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory
                  ? "No movies match your current filters. Try adjusting your search or category selection."
                  : "No movies are available at the moment."}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}