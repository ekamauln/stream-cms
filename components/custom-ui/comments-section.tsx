"use client";

import { useState } from "react";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";

interface CommentsSectionProps {
  movieId: number;
}

export function CommentsSection({ movieId }: CommentsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommentSubmitted = () => {
    // Increment trigger to refresh comment list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <CommentForm
        movieId={movieId}
        onCommentSubmitted={handleCommentSubmitted}
      />

      {/* Comment List */}
      <CommentList movieId={movieId} refreshTrigger={refreshTrigger} />
    </div>
  );
}
