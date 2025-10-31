import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Eye, Play } from "lucide-react";

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

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Unknown";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  return (
    <Link href={`/movie/${movie.slug}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl py-0">
        <div className="relative h-70 w-full overflow-hidden">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110 mt-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <Play className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Overlay with play button */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <Play className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
          </div>

          {/* Featured badge */}
          {movie.featured && (
            <div className="absolute left-2 top-2">
              <Badge className="bg-red-500 text-white">Featured</Badge>
            </div>
          )}

          {/* View count */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            {movie.viewCount.toLocaleString()}
          </div>
        </div>

        <CardContent className="pt-0 pb-4 px-4">
          <h3 className="mb-2 font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>

          {movie.synopsis && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {movie.synopsis}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {movie.categories.slice(0, 2).map((category) => (
              <Badge key={category.id} variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            ))}
            {movie.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{movie.categories.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {movie.releaseYear || "TBA"}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(movie.duration)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
