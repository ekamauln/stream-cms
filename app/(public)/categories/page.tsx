import { Metadata } from "next";
import { CategoryCard } from "@/components/custom-ui/category-card";
import db from "@/lib/db";

export const metadata: Metadata = {
  title: "Categories - Stream CMS",
  description: "Browse movies by categories - Action, Comedy, Drama, Horror, Sci-Fi and more",
  keywords: "movie categories, genres, film types, streaming categories",
};

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  _count: {
    movies: number;
  };
}

async function getAllCategories(): Promise<Category[]> {
  try {
    const categoriesData = await db.category.findMany({
      include: {
        _count: {
          select: {
            movies: {
              where: {
                isPublished: true, // Only count published movies
              },
            },
          },
        },
      },
      orderBy: [
        { name: "asc" }, // Alphabetical order
      ],
    });

    // Transform the data to match CategoryCard interface
    const categories: Category[] = categoriesData.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt,
      _count: {
        movies: category._count.movies,
      },
    }));

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Movie Categories</h1>
          <p className="text-muted-foreground text-lg">
            Discover movies by genre - Browse through our {categories.length} categories
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Categories Available</h3>
            <p className="text-muted-foreground">
              There are no categories created yet. Categories will appear here once they are added.
            </p>
          </div>
        )}

        {/* Statistics Section */}
        {categories.length > 0 && (
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Category Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {categories.reduce((sum, cat) => sum + cat._count.movies, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Movies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(categories.reduce((sum, cat) => sum + cat._count.movies, 0) / categories.length) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg per Category</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.max(...categories.map(cat => cat._count.movies), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Most Popular</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
