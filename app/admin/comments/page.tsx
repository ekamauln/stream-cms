"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Calendar,
  User,
  Film,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface CommentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface CommentMovie {
  id: number;
  title: string;
  slug: string;
}

interface Comment {
  id: number;
  movieId: number;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  text: string;
  isApproved: boolean;
  createdAt: string;
  user: CommentUser | null;
  movie: CommentMovie;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CommentsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [updateLoading, setUpdateLoading] = useState<{ [key: number]: boolean }>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (debouncedSearchTerm) {
          params.append('search', debouncedSearchTerm);
        }

        if (statusFilter !== 'all') {
          params.append('approved', (statusFilter === 'approved').toString());
        }

        const response = await fetch(`/api/comments?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        setComments(data.comments);
        setPagination(data.pagination);
      } catch {
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchComments();
    }
  }, [debouncedSearchTerm, statusFilter, pagination.page, pagination.limit, session]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleApproveComment = async (comment: Comment) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [comment.id]: true }));

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: !comment.isApproved
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const updatedComment = await response.json();
      setComments(prev => 
        prev.map(c => c.id === comment.id ? updatedComment : c)
      );
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update comment'}`);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [comment.id]: false }));
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [comment.id]: true }));

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments(prev => prev.filter(c => c.id !== comment.id));
      setDeletingComment(null);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete comment'}`);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [comment.id]: false }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStats = () => {
    const total = comments.length;
    const approved = comments.filter(c => c.isApproved).length;
    const pending = total - approved;

    return { total, approved, pending };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Comments Management</h1>
            <p className="text-muted-foreground">
              Review and manage user comments across all movies
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all movies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Visible to public
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search comments, movies, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("approved")}
                >
                  Approved
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading comments...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Movie</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-sm text-muted-foreground">
                          {searchTerm || statusFilter !== 'all'
                            ? "No comments found matching your criteria."
                            : "No comments yet. Comments will appear here once users start commenting on movies."
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    comments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {comment.user ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{comment.user.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {comment.user.email}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">
                                    {comment.authorName || "Anonymous"}
                                  </div>
                                  {comment.authorEmail && (
                                    <div className="text-xs text-muted-foreground">
                                      {comment.authorEmail}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/movie/${comment.movie.slug}`}
                            className="flex items-center gap-2 hover:text-primary"
                          >
                            <Film className="h-4 w-4" />
                            <span className="truncate max-w-[200px]">
                              {comment.movie.title}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="truncate" title={comment.text}>
                            {comment.text}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={comment.isApproved ? "default" : "secondary"}
                            className={comment.isApproved ? "bg-green-100 text-green-800" : ""}
                          >
                            {comment.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleApproveComment(comment)}
                                disabled={updateLoading[comment.id]}
                              >
                                {comment.isApproved ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Unapprove
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/movie/${comment.movie.slug}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Movie
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingComment(comment)}
                                className="text-red-600"
                                disabled={updateLoading[comment.id]}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} comments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingComment}
        onOpenChange={() => setDeletingComment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                &ldquo;{deletingComment?.text.substring(0, 100)}
                {deletingComment && deletingComment.text.length > 100 ? "..." : ""}&rdquo;
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingComment && handleDeleteComment(deletingComment)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingComment ? updateLoading[deletingComment.id] : false}
            >
              {deletingComment && updateLoading[deletingComment.id] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Comment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
