"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  synopsis: z.string().optional(),
  releaseYear: z.number().min(1900, "Release year must be after 1900").max(new Date().getFullYear() + 5, "Release year cannot be too far in the future").optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
  language: z.string().optional(),
  posterUrl: z.union([z.string().url("Invalid poster URL"), z.literal("")]).optional(),
  videoUrl: z.string().url("Invalid video URL"),
  isPublished: z.boolean().default(false),
  featured: z.boolean().default(false),
  categoryIds: z.array(z.number()).min(1, "At least one category is required"),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormProps {
  movieSlug?: string;
  initialData?: Partial<MovieFormData & {
    categories: Array<{ id: number; name: string; slug: string }>;
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function MovieForm({ movieSlug, initialData, onSuccess, onCancel }: MovieFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const router = useRouter();
  
  const isEdit = !!movieSlug;

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set empty array on error
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);
  
  const form = useForm<MovieFormData>({
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      synopsis: initialData?.synopsis || "",
      releaseYear: initialData?.releaseYear,
      duration: initialData?.duration,
      language: initialData?.language || "",
      posterUrl: initialData?.posterUrl || "",
      videoUrl: initialData?.videoUrl || "",
      isPublished: initialData?.isPublished ?? false,
      featured: initialData?.featured ?? false,
      categoryIds: initialData?.categories?.map(cat => cat.id) || [],
    },
  });

  // Auto-generate slug from title
  const watchedTitle = form.watch("title");
  useEffect(() => {
    if (watchedTitle && !isEdit) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
  }, [watchedTitle, isEdit, form]);

  const onSubmit = async (data: MovieFormData) => {
    try {
      setIsLoading(true);
      
      // Check if categories are still loading
      if (categoriesLoading) {
        console.error("Categories are still loading. Please wait.");
        return;
      }
      
      // Manual validation
      const validationResult = movieSchema.safeParse(data);
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error.issues);
        return;
      }
      
      const url = isEdit ? `/api/movies/${movieSlug}` : "/api/movies";
      const method = isEdit ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationResult.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEdit ? "update" : "create"} movie`);
      }

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/movies");
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} movie:`, error);
      // In production, you'd show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const currentIds = form.getValues("categoryIds");
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter(id => id !== categoryId)
      : [...currentIds, categoryId];
    form.setValue("categoryIds", newIds, { shouldValidate: true });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isEdit ? "Edit Movie" : "Create New Movie"}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit ? "Update movie information and settings" : "Add a new movie to your streaming platform"}
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter movie title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="movie-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </div>

            <FormField
              control={form.control}
              name="synopsis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Synopsis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter movie synopsis..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Movie Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Movie Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="releaseYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="2025"
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="120"
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media URLs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="posterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poster URL</FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://example.com/poster.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL *</FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://example.com/video.mp4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Categories</h3>
              <FormField
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Categories *</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {categoriesLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading categories...
                          </div>
                        ) : categories.length === 0 ? (
                          <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg">
                            No categories available. Please create categories first.
                          </div>
                        ) : (
                          categories.map((category) => {
                            const isSelected = field.value.includes(category.id);
                            return (
                              <Badge
                                key={category.id}
                                variant={isSelected ? "default" : "outline"}
                                className="cursor-pointer transition-all hover:opacity-80 hover:scale-105"
                                onClick={() => toggleCategory(category.id)}
                              >
                                {isSelected && <X className="h-3 w-3 mr-1" />}
                                {!isSelected && <Plus className="h-3 w-3 mr-1" />}
                                {category.name}
                              </Badge>
                            );
                          })
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Publishing Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Publishing Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Published</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this movie visible to the public
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Highlight this movie on the homepage
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading || categoriesLoading}>
                {(isLoading || categoriesLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {categoriesLoading ? "Loading..." : isEdit ? "Update Movie" : "Create Movie"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}