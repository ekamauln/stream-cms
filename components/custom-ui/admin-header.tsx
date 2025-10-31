"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { House, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useMemo } from "react";

interface AdminHeaderProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  entityName?: string; // For dynamic entities like movie titles, category names, etc.
}

export function AdminHeader({
  title,
  breadcrumbs,
  entityName,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  // Generate dynamic breadcrumbs based on current path and params
  const dynamicBreadcrumbs = useMemo(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const adminIndex = pathSegments.indexOf("admin");

    if (adminIndex === -1) return [];

    const adminSegments = pathSegments.slice(adminIndex + 1);
    const crumbs: Array<{ label: string; href?: string }> = [];

    // Build breadcrumbs from path segments
    adminSegments.forEach((segment, index) => {
      const href = "/admin/" + adminSegments.slice(0, index + 1).join("/");

      // Handle different route patterns
      switch (segment) {
        case "dashboard":
          crumbs.push({
            label: "Dashboard",
            href: index === adminSegments.length - 1 ? undefined : href,
          });
          break;
        case "movies":
          crumbs.push({
            label: "Movies",
            href: index === adminSegments.length - 1 ? undefined : href,
          });
          break;
        case "categories":
          crumbs.push({
            label: "Categories",
            href: index === adminSegments.length - 1 ? undefined : href,
          });
          break;
        case "comments":
          crumbs.push({
            label: "Comments",
            href: index === adminSegments.length - 1 ? undefined : href,
          });
          break;
        case "new":
          crumbs.push({ label: "New" });
          break;
        case "edit":
          crumbs.push({ label: "Edit" });
          break;
        default:
          // Handle dynamic segments (like slugs or IDs)
          if (params && Object.values(params).includes(segment)) {
            // This is a dynamic parameter - use entityName if provided
            const label = entityName || segment;
            crumbs.push({ label });
          } else {
            // Regular segment - capitalize first letter
            const label = segment.charAt(0).toUpperCase() + segment.slice(1);
            crumbs.push({
              label,
              href: index === adminSegments.length - 1 ? undefined : href,
            });
          }
          break;
      }
    });

    return crumbs;
  }, [pathname, params, entityName]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <House className="h-4 w-4" />
          </Link>
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
              {(breadcrumbs || dynamicBreadcrumbs).length > 0 && (
                <BreadcrumbSeparator />
              )}
              {(breadcrumbs || dynamicBreadcrumbs).map((breadcrumb, index) => (
                <div key={index} className="flex items-center">
                  {breadcrumb.href ? (
                    <BreadcrumbLink
                      href={breadcrumb.href}
                      className="hidden md:block"
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="hidden md:block">
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  )}
                  {index < (breadcrumbs || dynamicBreadcrumbs).length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </div>
              ))}
              {/* Fallback to title if no breadcrumbs */}
              {!breadcrumbs && dynamicBreadcrumbs.length === 0 && title && (
                <BreadcrumbPage className="hidden md:block">
                  {title}
                </BreadcrumbPage>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
