import { Metadata } from "next";
import { notFound } from "next/navigation";
import db from "@/lib/db";

interface MoviePageProps {
  params: {
    slug: string;
  };
}

async function getMovie(slug: string) {
  try {
    const movie = await db.movie.findUnique({
      where: {
        slug,
        isPublished: true, // Only show published movies
      },
      include: {
        categories: true,
      },
    });
    return movie;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const movie = await getMovie(params.slug);

  if (!movie) {
    return {
      title: "Movie Not Found",
    };
  }

  // Helper function to create SEO-optimized description with fallback
  const getSEODescription = (
    metaDesc?: string | null,
    synopsis?: string | null,
    title?: string
  ) => {
    const fallbackDesc = `Watch ${title} now on Stream CMS`;
    const description = metaDesc || synopsis || fallbackDesc;
    // Truncate to 160 characters for SEO best practices
    return description.length > 160
      ? description.substring(0, 157) + "..."
      : description;
  };

  const seoDescription = getSEODescription(
    movie.metaDescription,
    movie.synopsis,
    movie.title
  );

  return {
    title: movie.metaTitle || `${movie.title} - Stream CMS`,
    description: seoDescription,
    keywords:
      movie.metaKeywords || movie.categories.map((cat) => cat.name).join(", "),
    openGraph: {
      title: movie.metaTitle || movie.title,
      description: seoDescription,
      images: movie.posterUrl ? [movie.posterUrl] : [],
      type: "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title: movie.metaTitle || movie.title,
      description: seoDescription,
      images: movie.posterUrl ? [movie.posterUrl] : [],
    },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movie = await getMovie(params.slug);

  if (!movie) {
    notFound();
  }

  // Helper function for display description (no truncation for display)
  const getDisplayDescription = (
    metaDesc?: string | null,
    synopsis?: string | null
  ) => {
    return metaDesc || synopsis || "No description available.";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Movie Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {movie.duration && <span>{movie.duration} min</span>}
            {movie.language && <span>{movie.language}</span>}
          </div>
          {movie.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.categories.map((category) => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Video Player */}
        {movie.videoUrl && (
          <div className="mb-8">
            <div className="w-full max-w-4xl mx-auto rounded-lg shadow-lg overflow-hidden bg-black">
              {/* Check if it's an embed URL (YouTube, Vimeo, etc.) */}
              {movie.videoUrl.includes("embed") ||
              movie.videoUrl.includes("youtube.com") ||
              movie.videoUrl.includes("vimeo.com") ||
              movie.videoUrl.includes("wistia.com") ||
              movie.videoUrl.includes("short.icu") ? (
                <iframe
                  src={movie.videoUrl}
                  className="w-full aspect-video"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={movie.title}
                />
              ) : (
                /* Direct video file */
                <video
                  controls
                  className="w-full aspect-video"
                  poster={movie.posterUrl || undefined}
                  preload="metadata"
                >
                  <source src={movie.videoUrl} type="video/mp4" />
                  <source src={movie.videoUrl} type="video/webm" />
                  <source src={movie.videoUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {getDisplayDescription(movie.metaDescription, movie.synopsis)}
          </p>
        </div>

        {/* SEO Info (visible in development) */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">SEO Meta Tags Preview</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Meta Title:</strong>
              <span className="ml-2 text-muted-foreground">
                {movie.metaTitle || movie.title}
              </span>
            </div>
            <div>
              <strong>Meta Description:</strong>
              <p className="ml-2 text-muted-foreground mt-1 p-2 bg-background rounded border">
                {movie.metaDescription || (
                  <span>
                    <em className="text-orange-600">
                      Using synopsis as fallback:
                    </em>
                    <br />
                    {movie.synopsis || "No description available"}
                  </span>
                )}
              </p>
            </div>
            <div>
              <strong>Meta Keywords:</strong>
              <span className="ml-2 text-muted-foreground">
                {movie.metaKeywords ||
                  movie.categories.map((cat) => cat.name).join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
