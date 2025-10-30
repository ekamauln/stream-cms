"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { House, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!session) {
    return null;
  }

  const user = session.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div>
      <header className="flex h-16 items-center gap-2 justify-between">
        <div className="flex items-center gap-2 px-4">
          <Link href="/">
            <House className="h-4 w-4" />
          </Link>
          {/* Icon */}
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbPage className="hidden md:block">
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="px-4">
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <p className="mt-2 text-lg">
          Welcome back,{" "}
          <span className="font-semibold text-primary underline decoration-orange-400 decoration-2 underline-offset-4">
            {user?.name || user?.email}
          </span>
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ID
                  </p>
                  <p className="text-sm font-mono">{user?.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-sm">{user?.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email Status
                  </p>
                  <Badge variant={user?.emailVerified ? "default" : "secondary"}>
                    {user?.emailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Link href="/admin/movies">
                  <Button variant="outline" className="w-full justify-start">
                    Manage Movies
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full justify-start">
                    View Public Site
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Picture</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.image ? "Custom image set" : "Default avatar"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.image ? (
                    <Image 
                      src={user.image} 
                      alt="Profile" 
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
      </div>
    </div>
  );
}
