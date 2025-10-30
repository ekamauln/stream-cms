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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  categorySlug?: string;
  initialData?: Partial<CategoryFormData & {
    _count?: { movies: number };
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ categorySlug, initialData, onSuccess, onCancel }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const isEdit = !!categorySlug;
  
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
    },
  });

  const watchedName = form.watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !isEdit) {
      const slug = watchedName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchedName, isEdit, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      
      // Manual validation
      const validationResult = categorySchema.safeParse(data);
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error.issues);
        return;
      }
      
      const url = isEdit ? `/api/categories/${categorySlug}` : "/api/categories";
      const method = isEdit ? "PUT" : "POST";
      
      // For editing, include newSlug if slug has changed
      const requestData = isEdit && data.slug !== initialData?.slug 
        ? { ...validationResult.data, newSlug: data.slug }
        : validationResult.data;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEdit ? "update" : "create"} category`);
      }

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/categories");
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} category:`, error);
      // In production, you'd show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isEdit ? "Edit Category" : "Create New Category"}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit ? "Update category information" : "Add a new category to organize your movies"}
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Category Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Action, Comedy, Sci-Fi"
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug Field */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    URL Slug *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="action-movies"
                      className="h-10 font-mono text-sm"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Used in URLs. Auto-generated from name, but you can customize it.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of this category..."
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Optional description to help users understand this category.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Movie count display for edit mode */}
            {isEdit && initialData?._count?.movies !== undefined && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Movies in this category:</span>
                  <span className="text-sm text-muted-foreground">
                    {initialData._count.movies} movie{initialData._count.movies !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Update Category" : "Create Category"}
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else {
                    router.push("/admin/categories");
                  }
                }}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
