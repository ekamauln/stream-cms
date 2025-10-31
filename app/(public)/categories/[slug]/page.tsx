import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryMoviesClient } from "@/components/custom-ui/category-movies-client";
import { ArrowLeft, Folder, Film } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCategory(slug: string) {
  try {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        movies: {
          where: {
            isPublished: true,
          },
          select: {
            featured: true,
            viewCount: true,
          },
        },
        _count: {
          select: {
            movies: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });

    if (!category) return null;

    // Calculate statistics
    const featuredCount = category.movies.filter(movie => movie.featured).length;
    const totalViews = category.movies.reduce((sum, movie) => sum + movie.viewCount, 0);

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt,
      movieCount: category._count.movies,
      featuredCount,
      totalViews,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} Movies - Stream CMS`,
    description:
      category.description ||
      `Browse ${category.movieCount} movies in the ${category.name} category. ${category.featuredCount} featured movies with ${category.totalViews.toLocaleString()} total views.`,
    keywords: `${category.name}, movies, streaming, ${category.name} films, entertainment`,
    openGraph: {
      title: `${category.name} Movies`,
      description:
        category.description ||
        `Discover ${category.movieCount} amazing ${category.name} movies with ${category.totalViews.toLocaleString()} views`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
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
                {category.movieCount}{" "}
                {category.movieCount === 1 ? "movie" : "movies"}
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
            {category.movieCount}
          </div>
          <div className="text-sm text-muted-foreground">Total Movies</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">{category.featuredCount}</div>
          <div className="text-sm text-muted-foreground">Featured</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">{category.totalViews.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Views</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {new Date(category.createdAt).getFullYear()}
          </div>
          <div className="text-sm text-muted-foreground">Created</div>
        </div>
      </div>

      {/* Movies with Pagination */}
      <CategoryMoviesClient
        categorySlug={category.slug}
        categoryName={category.name}
      />
    </div>
  );
}
