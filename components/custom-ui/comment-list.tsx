"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Clock, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

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

interface CommentListProps {
  movieId: number;
  refreshTrigger?: number; // Used to trigger refresh from parent
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function CommentList({ movieId, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [error, setError] = useState("");

  const fetchComments = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `/api/comments?movieId=${movieId}&approved=true&page=${page}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  // Initial fetch and refresh when movieId changes
  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  // Refresh when parent triggers it (e.g., after new comment submission)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchComments(1);
    }
  }, [refreshTrigger, fetchComments]);

  const handlePageChange = (newPage: number) => {
    fetchComments(newPage);
  };

  const handleRefresh = () => {
    fetchComments(pagination.page);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments yet.</p>
              <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                  {/* Comment header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {comment.user?.image ? (
                        <Image
                          src={comment.user.image}
                          alt={comment.user.name || 'User'}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user?.name || comment.authorName || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment content */}
                  <div className="ml-11">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
  );
}
