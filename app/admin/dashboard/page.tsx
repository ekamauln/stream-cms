"use client";

import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns/format";

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="mt-2 text-lg">
          Welcome back,{" "}
          <span className="font-semibold text-primary underline decoration-orange-400 decoration-2 underline-offset-4">
            {user?.name || user?.email}
          </span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Member Since
                </p>
                <p className="text-sm">
                  {user?.createdAt
                    ? format(user.createdAt, "dd MMMM yyyy")
                    : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full justify-start">
                  Manage Categories
                </Button>
              </Link>
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
            <Separator />
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
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
      </div>
    </div>
  );
}
