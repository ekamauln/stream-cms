"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MovieForm } from "@/components/forms/movie-form";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Film,
  Loader2,
} from "lucide-react";

interface Movie {
  id: number;
  title: string;
  slug: string;
  synopsis?: string;
  releaseYear?: number;
  duration?: number;
  language?: string;
  posterUrl?: string;
  videoUrl: string;
  isPublished: boolean;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  // SEO Meta Tags
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export default function MoviesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const url = debouncedSearchQuery 
          ? `/api/movies?search=${encodeURIComponent(debouncedSearchQuery)}`
          : '/api/movies';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [debouncedSearchQuery]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Since we're using API search, no need for client-side filtering
  const filteredMovies = movies;

  const handleCreateMovie = () => {
    setEditingMovie(null);
    setIsFormOpen(true);
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const handleDeleteMovie = async (movie: Movie) => {
    try {
      // Make API call to delete movie
      const response = await fetch(`/api/movies/${movie.slug}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }
      
      setMovies(prev => prev.filter(m => m.id !== movie.id));
      setDeletingMovie(null);
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const handleTogglePublished = async (movie: Movie) => {
    try {
      // Make API call to update movie
      const response = await fetch(`/api/movies/${movie.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...movie,
          isPublished: !movie.isPublished 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update movie');
      }
      
      setMovies(prev => prev.map(m => 
        m.id === movie.id ? { ...m, isPublished: !m.isPublished } : m
      ));
    } catch (error) {
      console.error("Error updating movie:", error);
    }
  };

  const handleToggleFeatured = async (movie: Movie) => {
    try {
      // Make API call to update movie
      const response = await fetch(`/api/movies/${movie.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...movie,
          featured: !movie.featured 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update movie');
      }
      
      setMovies(prev => prev.map(m => 
        m.id === movie.id ? { ...m, featured: !m.featured } : m
      ));
    } catch (error) {
      console.error("Error updating movie:", error);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingMovie(null);
    
    // Refetch movies list
    const refetchMovies = async () => {
      setIsLoading(true);
      try {
        const url = debouncedSearchQuery 
          ? `/api/movies?search=${encodeURIComponent(debouncedSearchQuery)}`
          : '/api/movies';
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setMovies(data);
        }
      } catch (error) {
        console.error('Error refetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    refetchMovies();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Movies Management</h1>
            <p className="text-muted-foreground">
              Manage your movie collection, create new movies, and update existing ones.
            </p>
          </div>
          <Button onClick={handleCreateMovie} className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Add New Movie
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movies.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movies.filter(m => m.isPublished).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movies.filter(m => m.featured).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movies.reduce((sum, m) => sum + m.viewCount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Movie List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Movies Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground">Loading movies...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredMovies.length > 0 ? (
                    filteredMovies.map((movie) => (
                      <TableRow key={movie.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{movie.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {movie.releaseYear} • {movie.duration}min • {movie.language}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {movie.categories.map((category) => (
                              <Badge key={category.id} variant="secondary" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={movie.isPublished ? "default" : "secondary"}>
                              {movie.isPublished ? "Published" : "Draft"}
                            </Badge>
                            {movie.featured && (
                              <Badge variant="outline" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {movie.viewCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(movie.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditMovie(movie)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePublished(movie)}>
                                {movie.isPublished ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(movie)}>
                                {movie.featured ? (
                                  <>
                                    <StarOff className="mr-2 h-4 w-4" />
                                    Unfeature
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Feature
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingMovie(movie)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Film className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchQuery ? "No movies match your search" : "No movies found"}
                          </p>
                          {!searchQuery && (
                            <Button variant="outline" onClick={handleCreateMovie}>
                              <Plus className="mr-2 h-4 w-4" />
                              Create your first movie
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movie Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMovie ? "Edit Movie" : "Create New Movie"}
            </DialogTitle>
          </DialogHeader>
          <MovieForm
            movieSlug={editingMovie?.slug}
            initialData={editingMovie || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMovie} onOpenChange={() => setDeletingMovie(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Movie</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingMovie?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMovie && handleDeleteMovie(deletingMovie)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}