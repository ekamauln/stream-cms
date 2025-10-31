"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Film } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  slug: string;
  viewCount: number;
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
}

export function ViewAnalytics() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("/api/movies");
        if (response.ok) {
          const data = await response.json();
          // Sort by view count descending
          const sortedData = data.sort((a: Movie, b: Movie) => b.viewCount - a.viewCount);
          setMovies(sortedData);
        }
      } catch (error) {
        console.error("Error fetching movies for analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const totalViews = movies.reduce((sum, movie) => sum + movie.viewCount, 0);
  const publishedMovies = movies.filter(movie => movie.isPublished);
  const topMovies = movies.slice(0, 10);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="h-32 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {publishedMovies.length} published movies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publishedMovies.length > 0 
                ? Math.round(totalViews / publishedMovies.length).toLocaleString()
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per published movie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topMovies[0]?.viewCount.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {topMovies[0]?.title || "No movies yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Most Viewed Movies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMovies.length > 0 ? (
              topMovies.map((movie, index) => (
                <div key={movie.id} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{movie.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {movie.slug}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={movie.isPublished ? "default" : "secondary"}>
                      {movie.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {movie.featured && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                    <div className="text-right">
                      <div className="font-medium">{movie.viewCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No movies found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}