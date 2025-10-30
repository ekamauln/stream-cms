import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="h-8"
      >
        All Movies
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.slug)}
          className="h-8"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}