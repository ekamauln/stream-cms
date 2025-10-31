import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, Film } from "lucide-react";

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

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50">
        <CardContent className="p-6">
          {/* Category Icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
            <Folder className="w-8 h-8 text-primary" />
          </div>

          {/* Category Name */}
          <h3 className="text-xl font-semibold text-center mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Movie Count */}
          <div className="flex items-center justify-center gap-2">
            <Film className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {category._count.movies} {category._count.movies === 1 ? 'Movie' : 'Movies'}
            </Badge>
          </div>

          {/* Created Date */}
          <div className="text-xs text-muted-foreground text-center mt-3">
            Created {new Date(category.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
