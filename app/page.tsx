"use client";

import { useState, useMemo } from "react";
import { MovieCard } from "@/components/custom-ui/movie-card";
import { CategoryFilter } from "@/components/custom-ui/category-filter";
import { SearchBar } from "@/components/custom-ui/search-bar";
import { Header } from "@/components/custom-ui/header";
import { Footer } from "@/components/custom-ui/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Sparkles, TrendingUp } from "lucide-react";

// Mock data - In production, this would come from your API
const mockMovies = [
  {
    id: 1,
    title: "The Quantum Paradox",
    slug: "quantum-paradox",
    synopsis:
      "A brilliant scientist discovers a way to manipulate time, but each change creates devastating consequences across parallel universes.",
    releaseYear: 2024,
    duration: 142,
    language: "English",
    posterUrl: null,
    isPublished: true,
    featured: true,
    viewCount: 15420,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    categories: [
      { id: 1, name: "Sci-Fi", slug: "sci-fi" },
      { id: 2, name: "Thriller", slug: "thriller" },
    ],
  },
  {
    id: 2,
    title: "Ocean's Legacy",
    slug: "oceans-legacy",
    synopsis:
      "Deep beneath the Pacific Ocean, marine biologists discover an ancient civilization that holds the key to Earth's future.",
    releaseYear: 2024,
    duration: 118,
    language: "English",
    posterUrl: null,
    isPublished: true,
    featured: false,
    viewCount: 8930,
    createdAt: new Date("2024-02-20T14:30:00Z"),
    categories: [
      { id: 3, name: "Adventure", slug: "adventure" },
      { id: 4, name: "Drama", slug: "drama" },
    ],
  },
  {
    id: 3,
    title: "Digital Echoes",
    slug: "digital-echoes",
    synopsis:
      "In a world where consciousness can be uploaded to the cloud, a hacker fights to preserve human authenticity.",
    releaseYear: 2023,
    duration: 105,
    language: "English",
    posterUrl: null,
    isPublished: true,
    featured: true,
    viewCount: 23156,
    createdAt: new Date("2023-11-05T09:15:00Z"),
    categories: [
      { id: 1, name: "Sci-Fi", slug: "sci-fi" },
      { id: 5, name: "Action", slug: "action" },
    ],
  },
  {
    id: 4,
    title: "The Last Garden",
    slug: "last-garden",
    synopsis:
      "After climate change devastates Earth, a small community fights to preserve the last remaining natural ecosystem.",
    releaseYear: 2024,
    duration: 134,
    language: "English",
    posterUrl: null,
    isPublished: true,
    featured: false,
    viewCount: 12045,
    createdAt: new Date("2024-03-12T16:45:00Z"),
    categories: [
      { id: 4, name: "Drama", slug: "drama" },
      { id: 6, name: "Environmental", slug: "environmental" },
    ],
  },
];

const mockCategories = [
  { id: 1, name: "Sci-Fi", slug: "sci-fi", description: "Science Fiction" },
  { id: 2, name: "Thriller", slug: "thriller", description: "Thriller Movies" },
  {
    id: 3,
    name: "Adventure",
    slug: "adventure",
    description: "Adventure Films",
  },
  { id: 4, name: "Drama", slug: "drama", description: "Drama Movies" },
  { id: 5, name: "Action", slug: "action", description: "Action Movies" },
  {
    id: 6,
    name: "Environmental",
    slug: "environmental",
    description: "Environmental Films",
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter movies based on search and category
  const filteredMovies = useMemo(() => {
    let filtered = mockMovies;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((movie) =>
        movie.categories.some((cat) => cat.slug === selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.synopsis?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const featuredMovies = mockMovies.filter((movie) => movie.featured);
  const totalViews = mockMovies.reduce(
    (sum, movie) => sum + movie.viewCount,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Discover Amazing <span className="text-primary">Movies</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Explore our curated collection of films across all genres. From
              blockbuster hits to indie gems.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {mockMovies.length}
                </div>
                <div className="text-sm text-muted-foreground">Movies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {mockCategories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Movies Section */}
        {featuredMovies.length > 0 && (
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

        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">All Movies</h2>
              <Badge variant="outline" className="ml-2">
                {filteredMovies.length}
              </Badge>
            </div>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="mt-4">
            <CategoryFilter
              categories={mockCategories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </section>

        {/* Movies Grid */}
        <section>
          {filteredMovies.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
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

      <Footer />
    </div>
  );
}
