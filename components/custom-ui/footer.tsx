import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">StreamCMS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 StreamCMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}