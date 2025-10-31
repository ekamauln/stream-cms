import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieCard } from "@/components/custom-ui/movie-card";
import { ArrowLeft, Folder, Film } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
}

async function getCategoryWithMovies(slug: string) {
  try {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        movies: {
          where: {
            isPublished: true, // Only show published movies
          },
          include: {
            categories: true,
          },
          orderBy: [
            { featured: "desc" }, // Featured movies first
            { createdAt: "desc" }, // Then by newest
          ],
        },
      },
    });

    if (!category) return null;

    // Transform movies data to match MovieCard interface
    const transformedMovies: Movie[] = category.movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      synopsis: movie.synopsis || undefined,
      releaseYear: movie.releaseYear || undefined,
      duration: movie.duration || undefined,
      language: movie.language || undefined,
      posterUrl: movie.posterUrl,
      isPublished: movie.isPublished,
      featured: movie.featured,
      viewCount: movie.viewCount,
      createdAt: movie.createdAt,
      categories: movie.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
    }));

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdAt: category.createdAt,
      },
      movies: transformedMovies,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryWithMovies(slug);

  if (!data) {
    return {
      title: "Category Not Found",
    };
  }

  const { category, movies } = data;

  return {
    title: `${category.name} Movies - Stream CMS`,
    description:
      category.description ||
      `Browse ${movies.length} movies in the ${category.name} category`,
    keywords: `${category.name}, movies, streaming, ${category.name} films, entertainment`,
    openGraph: {
      title: `${category.name} Movies`,
      description:
        category.description ||
        `Discover ${movies.length} amazing ${category.name} movies`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await getCategoryWithMovies(slug);

  if (!data) {
    notFound();
  }

  const { category, movies } = data;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{category.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Film className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {movies.length} {movies.length === 1 ? "movie" : "movies"}
                </span>
              </div>
            </div>
          </div>

          {category.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {movies.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Movies</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {movies.filter((movie) => movie.featured).length}
            </div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {movies
                .reduce((sum, movie) => sum + movie.viewCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {new Date(category.createdAt).getFullYear()}
            </div>
            <div className="text-sm text-muted-foreground">Created</div>
          </div>
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No Movies in This Category
            </h3>
            <p className="text-muted-foreground mb-4">
              There are no published movies in the {category.name} category yet.
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Browse All Movies
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
